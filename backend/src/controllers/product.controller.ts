// ============================================
// 📄 FILENAME: product.controller.ts (ENHANCED)
// 📍 PATH: backend/src/controllers/product.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const productService = new ProductService();

export class ProductController {
  
  // ============================================
  // ENHANCED SEARCH with AI & Filters
  // ============================================
  
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        q,                    // Search query
        category,             // Category filter
        minPrice,             // Min price in Pi
        maxPrice,             // Max price in Pi
        condition,            // new, used_like_new, used_good, used_fair
        location,             // Location filter
        brand,                // Brand filter
        sortBy,               // relevance, price_low, price_high, newest, popular
        page = 1,
        limit = 20
      } = req.query;
      
      // Build where clause
      const where: any = {
        stock: { gt: 0 }
      };
      
      // Text search (title & description)
      if (q) {
        where.OR = [
          { title: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } }
        ];
      }
      
      // Category filter
      if (category && category !== 'all') {
        where.category = category;
      }
      
      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price_pi = {};
        if (minPrice !== undefined) {
          where.price_pi.gte = parseFloat(minPrice as string);
        }
        if (maxPrice !== undefined) {
          where.price_pi.lte = parseFloat(maxPrice as string);
        }
      }
      
      // Condition filter (stored in ai_meta)
      if (condition && condition !== 'all') {
        where.ai_meta = {
          path: ['condition'],
          equals: condition
        };
      }
      
      // Location filter (stored in ai_meta)
      if (location && location !== 'all') {
        where.ai_meta = {
          path: ['location'],
          equals: location
        };
      }
      
      // Brand filter (stored in ai_meta)
      if (brand && brand !== 'all') {
        where.ai_meta = {
          path: ['brand'],
          equals: brand
        };
      }
      
      // Determine sort order
      let orderBy: any = { created_at: 'desc' }; // Default: newest
      
      switch (sortBy) {
        case 'price_low':
          orderBy = { price_pi: 'asc' };
          break;
        case 'price_high':
          orderBy = { price_pi: 'desc' };
          break;
        case 'popular':
          orderBy = { views: { _count: 'desc' } };
          break;
        case 'newest':
          orderBy = { created_at: 'desc' };
          break;
        case 'relevance':
        default:
          // For relevance, we'll use a mix of factors
          // In production, you'd use Elasticsearch or similar
          orderBy = { created_at: 'desc' };
      }
      
      // Execute search
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: parseInt(limit as string),
          orderBy,
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                reviews: true,
                views: true
              }
            }
          }
        }),
        prisma.product.count({ where })
      ]);
      
      // Save search query to history (if user is authenticated)
      if (q && req.user) {
        await prisma.searchHistory.create({
          data: {
            user_id: req.user.id,
            query: q as string,
            filters: {
              category,
              minPrice,
              maxPrice,
              condition,
              location,
              brand,
              sortBy
            }
          }
        });
      }
      
      res.json({
        success: true,
        data: {
          products,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string))
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // AI SEARCH SUGGESTIONS
  // ============================================
  
  async getSearchSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      
      if (!query || query.length < 3) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      // Get popular searches
      const popularSearches = await prisma.searchHistory.groupBy({
        by: ['query'],
        _count: {
          query: true
        },
        where: {
          query: {
            contains: query,
            mode: 'insensitive'
          }
        },
        orderBy: {
          _count: {
            query: 'desc'
          }
        },
        take: 5
      });
      
      // Get matching products
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ],
          stock: { gt: 0 }
        },
        select: {
          title: true
        },
        distinct: ['title'],
        take: 3
      });
      
      // Combine suggestions
      const suggestions = [
        ...popularSearches.map(s => ({
          type: 'popular',
          text: s.query
        })),
        ...products.map(p => ({
          type: 'product',
          text: p.title
        }))
      ];
      
      res.json({
        success: true,
        data: suggestions
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // VISUAL SEARCH (Image-based)
  // ============================================
  
  async visualSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No image provided', 400);
      }
      
      // Call AI service for image analysis
      const aiAnalysis = await aiService.analyzeImage(req.file.buffer);
      
      if (!aiAnalysis || !aiAnalysis.category) {
        throw new AppError('Could not analyze image', 400);
      }
      
      // Search for similar products
      const products = await prisma.product.findMany({
        where: {
          category: aiAnalysis.category,
          stock: { gt: 0 },
          OR: [
            { title: { contains: aiAnalysis.description, mode: 'insensitive' } },
            { description: { contains: aiAnalysis.description, mode: 'insensitive' } }
          ]
        },
        take: 20,
        include: {
          seller: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      res.json({
        success: true,
        data: {
          analysis: aiAnalysis,
          products
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // GET ALL PRODUCTS (With Basic Filters)
  // ============================================
  
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await productService.getAll({ page, limit });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // GET BY ID (With View Tracking)
  // ============================================
  
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.getById(parseInt(req.params.id));
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // GET BY CATEGORY
  // ============================================
  
  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await productService.getByCategory(category, { page, limit });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // CREATE PRODUCT
  // ============================================
  
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const product = await productService.create({
        ...req.body,
        seller_id: req.user.id
      });
      
      res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // UPDATE PRODUCT
  // ============================================
  
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const product = await productService.update(
        parseInt(req.params.id),
        req.user.id,
        req.body
      );
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // DELETE PRODUCT
  // ============================================
  
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      await productService.delete(parseInt(req.params.id), req.user.id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ============================================
  // GET MY PRODUCTS (Seller)
  // ============================================
  
  async getMyProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const products = await productService.getSellerProducts(req.user.id);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }
}
