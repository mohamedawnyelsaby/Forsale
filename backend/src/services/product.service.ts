// ============================================
// 📄 FILENAME: product.service.ts
// 📍 PATH: backend/src/services/product.service.ts
// 🌍 GLOBAL EDITION - World-class product management system
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AIService } from './ai.service';
import { logger } from '../utils/logger';

const aiService = new AIService();

/**
 * @class ProductService
 * @description Global product management service with AI integration and worldwide marketplace support
 * @version 2.3.0
 */
export class ProductService {
  /**
   * Retrieves all products with pagination and filtering
   * @param options - Pagination options
   * @param region - Regional filter
   * @param language - Language preference for content
   * @returns Paginated product list with metadata
   */
  async getAll(options: { 
    page: number; 
    limit: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc' 
  }, region?: string, language: string = 'en') {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    
    // Build where clause with optional region filter
    const where: any = {
      stock: { gt: 0 },
      status: 'active'
    };
    
    if (region && region !== 'global') {
      where.seller = {
        region: region
      };
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              region: true,
              trust_score: true,
              is_verified: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      prisma.product.count({
        where
      })
    ]);
    
    // Localize product content based on language
    const localizedProducts = products.map(product => 
      this.localizeProductContent(product, language)
    );
    
    return {
      products: localizedProducts,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      },
      meta {
        region: region || 'global',
        language: language,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Retrieves a product by ID with detailed information
   * @param id - Product ID
   * @param language - Language preference
   * @returns Product details with seller information and reviews
   */
  async getById(id: number, language: string = 'en') {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            region: true,
            trust_score: true,
            is_verified: true,
            member_since: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                trust_score: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          take: 5 // Limit to 5 most recent reviews
        },
        related_products: {
          take: 4,
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
    
    if (!product) {
      logger.warn(`Product not found with ID: ${id}`);
      throw new AppError('Product not found', 404);
    }
    
    // Track view for analytics
    await prisma.productView.create({
       {
        product_id: id,
        viewed_at: new Date()
      }
    });
    
    // Calculate dynamic trust score if needed
    if (!product.trust_score || product.trust_score_updated_at < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      await this.calculateAndStoreTrustScore(id);
    }
    
    // Localize content
    return this.localizeProductContent(product, language);
  }
  
  /**
   * Advanced global search with multiple filters
   * @param params - Search parameters including query, filters, and pagination
   * @param userRegion - User's region for localized results
   * @param userLanguage - User's language preference
   * @returns Search results with pagination and metadata
   */
  async globalSearch(params: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    trustScore?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }, userRegion?: string, userLanguage: string = 'en') {
    const {
      query, category, region, minPrice, maxPrice, 
      trustScore, sortBy = 'relevance', sortOrder = 'desc',
      page, limit
    } = params;
    
    const skip = (page - 1) * limit;
    const where: any = {
      stock: { gt: 0 },
      status: 'active'
    };
    
    // Apply region filter if specified
    if (region && region !== 'global') {
      where.seller = {
        region: region
      };
    }
    // Otherwise use user's region as default
    else if (userRegion && userRegion !== 'global') {
      where.seller = {
        region: userRegion
      };
    }
    
    // Apply category filter
    if (category) {
      where.category = category;
    }
    
    // Apply price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price_pi = {};
      if (minPrice !== undefined) {
        where.price_pi.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price_pi.lte = maxPrice;
      }
    }
    
    // Apply trust score filter
    if (trustScore !== undefined) {
      where.trust_score = {
        gte: trustScore
      };
    }
    
    // Apply search query with multi-language support
    if (query && query.trim() !== '') {
      const searchQuery = query.trim().toLowerCase();
      
      // Determine which fields to search based on language
      const titleField = userLanguage === 'ar' ? 'title_ar' : 'title_en';
      const descriptionField = userLanguage === 'ar' ? 'description_ar' : 'description_en';
      
      where.OR = [
        { [titleField]: { contains: searchQuery, mode: 'insensitive' } },
        { [descriptionField]: { contains: searchQuery, mode: 'insensitive' } },
        { sku: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { has: searchQuery } } // Search in array tags
      ];
    }
    
    // Determine sort field
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price_pi: sortOrder };
        break;
      case 'newest':
        orderBy = { created_at: sortOrder };
        break;
      case 'rating':
        orderBy = { average_rating: sortOrder };
        break;
      case 'trust':
        orderBy = { trust_score: sortOrder };
        break;
      default: // 'relevance'
        orderBy = { created_at: 'desc' };
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              region: true,
              trust_score: true,
              is_verified: true
            }
          }
        },
        orderBy
      }),
      prisma.product.count({ where })
    ]);
    
    // Localize products
    const localizedProducts = products.map(product => 
      this.localizeProductContent(product, userLanguage)
    );
    
    // Calculate relevance scores if needed
    if (sortBy === 'relevance' && query) {
      this.calculateRelevanceScores(localizedProducts, query);
    }
    
    return {
      products: localizedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        has_next: page < Math.ceil(total / limit),
        has_prev: page > 1
      },
      meta {
        search_query: query,
        filters_applied: {
          region: region || userRegion,
          category,
          min_price: minPrice,
          max_price: maxPrice,
          trust_score: trustScore
        },
        sort: { by: sortBy, order: sortOrder },
        language: userLanguage,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Creates a new product with AI analysis
   * @param data - Product data
   * @param userId - Seller ID
   * @returns Created product
   */
  async create( any, userId: number) {
    // Validate seller exists and is active
    const seller = await prisma.user.findUnique({
      where: { id: userId, status: 'active' }
    });
    
    if (!seller) {
      throw new AppError('Invalid or inactive seller', 400);
    }
    
    // Get AI analysis if images provided
    let aiMeta = null;
    if (data.images && data.images.length > 0) {
      aiMeta = await aiService.analyzeProduct({
        description: data.description,
        images: data.images,
        language: seller.language || 'en',
        region: seller.region || 'global'
      });
    }
    
    // Determine category with AI assistance
    let category = data.category;
    if (aiMeta?.detected_category && !category) {
      category = aiMeta.detected_category;
    }
    
    // Calculate initial trust score based on seller reputation
    const trustScore = Math.min(100, Math.max(70, seller.trust_score || 85));
    
    // Create product
    const product = await prisma.product.create({
       {
        seller_id: userId,
        title: data.title,
        title_ar: data.title_ar || data.title,
        title_en: data.title_en || data.title,
        description: data.description,
        description_ar: data.description_ar || data.description,
        description_en: data.description_en || data.description,
        price_pi: data.price_pi,
        category: category,
        images: data.images || [],
        stock: data.stock || 1,
        status: 'pending_review', // New products require review
        ai_meta: aiMeta,
        trust_score: trustScore,
        trust_score_updated_at: new Date(),
        sku: data.sku || this.generateSKU(),
        tags: data.tags || [],
        shipping_options: data.shipping_options || ['standard'],
        warranty_period: data.warranty_period || '30 days'
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    logger.info(`New product created: ${product.id} by seller: ${userId}`);
    return product;
  }
  
  /**
   * Updates an existing product
   * @param id - Product ID
   * @param userId - User ID (for authorization)
   * @param data - Update data
   * @returns Updated product
   */
  async update(id: number, userId: number,  any) {
    // Get existing product
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    // Check ownership
    if (product.seller_id !== userId) {
      logger.warn(`Unauthorized update attempt on product ${id} by user ${userId}`);
      throw new AppError('Not authorized to update this product', 403);
    }
    
    // Get AI analysis if images are updated
    let aiMeta = product.ai_meta;
    if (data.images && JSON.stringify(data.images) !== JSON.stringify(product.images)) {
      aiMeta = await aiService.analyzeProduct({
        description: data.description || product.description,
        images: data.images,
        language: data.language || 'en',
        region: data.region || 'global'
      });
    }
    
    // Update product
    const updated = await prisma.product.update({
      where: { id },
       {
        title: data.title || product.title,
        title_ar: data.title_ar || product.title_ar,
        title_en: data.title_en || product.title_en,
        description: data.description || product.description,
        description_ar: data.description_ar || product.description_ar,
        description_en: data.description_en || product.description_en,
        price_pi: data.price_pi || product.price_pi,
        category: data.category || product.category,
        images: data.images || product.images,
        stock: data.stock !== undefined ? data.stock : product.stock,
        ai_meta: aiMeta,
        shipping_options: data.shipping_options || product.shipping_options,
        warranty_period: data.warranty_period || product.warranty_period,
        updated_at: new Date()
      }
    });
    
    logger.info(`Product updated: ${id} by seller: ${userId}`);
    return updated;
  }
  
  /**
   * Deletes a product
   * @param id - Product ID
   * @param userId - User ID (for authorization)
   */
  async delete(id: number, userId: number) {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.seller_id !== userId) {
      logger.warn(`Unauthorized delete attempt on product ${id} by user ${userId}`);
      throw new AppError('Not authorized to delete this product', 403);
    }
    
    // Soft delete instead of hard delete
    await prisma.product.update({
      where: { id },
       { 
        status: 'deleted',
        deleted_at: new Date()
      }
    });
    
    logger.info(`Product deleted: ${id} by seller: ${userId}`);
  }
  
  /**
   * Gets all products for a specific seller
   * @param sellerId - Seller ID
   * @param status - Optional status filter
   * @returns Seller's products
   */
  async getSellerProducts(sellerId: number, status?: string) {
    const where: any = {
      seller_id: sellerId
    };
    
    if (status) {
      where.status = status;
    }
    
    return await prisma.product.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });
  }
  
  /**
   * Calculates and stores trust score for a product
   * @param productId - Product ID
   * @returns Calculated trust score
   */
  async calculateAndStoreTrustScore(productId: number) {
    const [product, reviews, disputes] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.review.findMany({ where: { product_id: productId } }),
      prisma.dispute.findMany({ where: { product_id: productId, status: 'resolved' } })
    ]);
    
    if (!product) {
      logger.error(`Cannot calculate trust score for non-existent product: ${productId}`);
      return 0;
    }
    
    let trustScore = 90; // Base score
    
    // Adjust based on review ratings
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length;
      trustScore += (avgRating - 3) * 5; // Scale rating impact
    }
    
    // Adjust based on dispute resolution rate
    if (disputes.length > 0) {
      const resolvedCount = disputes.filter(d => d.resolution_satisfaction >= 4).length;
      const resolutionRate = resolvedCount / disputes.length;
      trustScore += (resolutionRate - 0.7) * 20; // Bonus for high resolution satisfaction
    }
    
    // Adjust based on product age
    const productAgeDays = (Date.now() - product.created_at.getTime()) / (24 * 60 * 60 * 1000);
    if (productAgeDays > 30) {
      trustScore += 2; // Older products get slight trust boost
    }
    
    // Adjust based on seller trust
    const seller = await prisma.user.findUnique({ where: { id: product.seller_id } });
    if (seller) {
      trustScore = (trustScore + seller.trust_score) / 2; // Average with seller trust
    }
    
    // Ensure trust score is within valid range
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));
    
    // Update product with new trust score
    await prisma.product.update({
      where: { id: productId },
       { 
        trust_score: trustScore,
        trust_score_updated_at: new Date()
      }
    });
    
    logger.info(`Trust score updated for product ${productId}: ${trustScore}`);
    return trustScore;
  }
  
  /**
   * Localizes product content based on language
   * @param product - Product object
   * @param language - Target language
   * @returns Localized product
   */
  private localizeProductContent(product: any, language: string) {
    let title = product.title;
    let description = product.description;
    
    if (language === 'ar') {
      title = product.title_ar || product.title;
      description = product.description_ar || product.description;
    } else {
      // Default to English or fallback to title
      title = product.title_en || product.title;
      description = product.description_en || product.description;
    }
    
    return {
      ...product,
      localized_title: title,
      localized_description: description,
      language: language
    };
  }
  
  /**
   * Calculates relevance scores for search results
   * @param products - Array of products
   * @param query - Search query
   */
  private calculateRelevanceScores(products: any[], query: string) {
    const keywords = query.toLowerCase().split(/\s+/);
    
    products.forEach(product => {
      let relevance = 0.5; // Base relevance
      
      // Title match boost
      const title = (product.localized_title || product.title || '').toLowerCase();
      if (keywords.some(k => title.includes(k))) {
        relevance += 0.3;
      }
      
      // Exact match boost
      if (title.includes(query.toLowerCase())) {
        relevance += 0.2;
      }
      
      // Trust score boost
      relevance += (product.trust_score || 90) / 500;
      
      // Recency boost
      const hoursOld = (Date.now() - product.created_at.getTime()) / (60 * 60 * 1000);
      if (hoursOld < 24) {
        relevance += 0.1;
      }
      
      product.relevance_score = Math.min(1.0, Math.max(0, relevance));
    });
    
    // Sort by relevance score
    products.sort((a, b) => b.relevance_score - a.relevance_score);
  }
  
  /**
   * Generates a unique SKU for products
   * @returns Random SKU string
   */
  private generateSKU(): string {
    return `FS-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
}
