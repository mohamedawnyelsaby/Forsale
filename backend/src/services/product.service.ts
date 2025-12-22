// ============================================
// 📄 FILENAME: product.service.ts (FIXED)
// 📍 PATH: backend/src/services/product.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { AIService } from './ai.service';

const aiService = new AIService();

export class ProductService {
  async getAll(options: { page: number; limit: number }): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: options.limit,
        where: {
          stock: { gt: 0 }
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.product.count({
        where: {
          stock: { gt: 0 }
        }
      })
    ]);
    
    return {
      products,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    };
  }
  
  async getById(id: number): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    await prisma.productView.create({
      data: {
        product_id: id,
        viewed_at: new Date()
      }
    });
    
    return product;
  }
  
  async search(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page: number;
    limit: number;
  }): Promise<any> {
    const skip = (params.page - 1) * params.limit;
    
    const where: any = {
      stock: { gt: 0 }
    };
    
    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } }
      ];
    }
    
    if (params.category) {
      where.category = params.category;
    }
    
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price_pi = {};
      if (params.minPrice !== undefined) {
        where.price_pi.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.price_pi.lte = params.maxPrice;
      }
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: params.limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);
    
    return {
      products,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit)
      }
    };
  }
  
  async getByCategory(category: string, options: { page: number; limit: number }): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          category,
          stock: { gt: 0 }
        },
        skip,
        take: options.limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          category,
          stock: { gt: 0 }
        }
      })
    ]);
    
    return {
      products,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    };
  }
  
  async create(data: any): Promise<any> {
    let aiMeta = null;
    if (data.images && data.images.length > 0) {
      aiMeta = await aiService.analyzeProduct({
        description: data.description,
        images: data.images
      });
    }
    
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
    
    const product = await prisma.product.create({
      data: {
        seller_id: data.seller_id,
        title: data.title,
        slug,
        description: data.description,
        price_pi: data.price_pi,
        category: data.category,
        images: data.images || [],
        stock: data.stock || 1,
        ai_meta: aiMeta
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
    
    return product;
  }
  
  async update(id: number, userId: number, data: any): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.seller_id !== userId) {
      throw new AppError('Not authorized to update this product', 403);
    }
    
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price_pi: data.price_pi,
        category: data.category,
        images: data.images,
        stock: data.stock
      }
    });
    
    return updated;
  }
  
  async delete(id: number, userId: number): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.seller_id !== userId) {
      throw new AppError('Not authorized to delete this product', 403);
    }
    
    await prisma.product.delete({
      where: { id }
    });
  }
  
  async getSellerProducts(sellerId: number): Promise<any[]> {
    return await prisma.product.findMany({
      where: {
        seller_id: sellerId
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
}
