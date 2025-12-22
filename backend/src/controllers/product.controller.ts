// ============================================
// 📄 FILENAME: product.controller.ts (FIXED)
// 📍 PATH: backend/src/controllers/product.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';

const productService = new ProductService();

export class ProductController {
  
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        condition,
        location,
        brand,
        sortBy = 'newest',
        page = 1,
        limit = 20
      } = req.query;
      
      const where: any = {
        stock: { gt: 0 }
      };
      
      if (q) {
        where.OR = [
          { title: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } }
        ];
      }
      
      if (category && category !== 'all') {
        where.category = category;
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price_pi = {};
        if (minPrice !== undefined) {
          where.price_pi.gte = parseFloat(minPrice as string);
        }
        if (maxPrice !== undefined) {
          where.price_pi.lte = parseFloat(maxPrice as string);
        }
      }
      
      let orderBy: any = { created_at: 'desc' };
      
      switch (sortBy) {
        case 'price_low':
          orderBy = { price_pi: 'asc' };
          break;
        case 'price_high':
          orderBy = { price_pi: 'desc' };
          break;
        case 'newest':
          orderBy = { created_at: 'desc' };
          break;
      }
      
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
            }
          }
        }),
        prisma.product.count({ where })
      ]);
      
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
      console.error('Search error:', error);
      next(error);
    }
  }
  
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  
  async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
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
  
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
  
  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
  
  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
  
  async getMyProducts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
