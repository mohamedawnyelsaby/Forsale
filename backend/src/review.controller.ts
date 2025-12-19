// ============================================
// 📄 FILENAME: review.controller.ts
// 📍 PATH: backend/src/controllers/review.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const reviewService = new ReviewService();

export class ReviewController {
  async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await reviewService.getProductReviews(productId);
      
      res.json({
        success: true,
        data: reviews
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
      
      const review = await reviewService.create({
        user_id: req.user.id,
        product_id: req.body.product_id,
        rating: req.body.rating,
        comment: req.body.comment
      });
      
      res.status(201).json({
        success: true,
        data: review
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
      
      await reviewService.delete(parseInt(req.params.id), req.user.id);
      
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
