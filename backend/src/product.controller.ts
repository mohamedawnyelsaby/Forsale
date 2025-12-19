// ============================================
// 📄 FILENAME: product.controller.ts
// 📍 PATH: backend/src/controllers/product.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const productService = new ProductService();

export class ProductController {
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
  
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
      
      const result = await productService.search({
        query: q as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
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
