// ============================================
// 📄 FILENAME: review.service.ts
// 📍 PATH: backend/src/services/review.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class ReviewService {
  async getProductReviews(productId: number) {
    const reviews = await prisma.review.findMany({
      where: { product_id: productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    return {
      reviews,
      stats: {
        total: reviews.length,
        average: parseFloat(avgRating.toFixed(1))
      }
    };
  }
  
  async create(data: {
    user_id: number;
    product_id: number;
    rating: number;
    comment?: string;
  }) {
    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: {
        user_id_product_id: {
          user_id: data.user_id,
          product_id: data.product_id
        }
      }
    });
    
    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }
    
    // Check if user bought the product
    const order = await prisma.order.findFirst({
      where: {
        buyer_id: data.user_id,
        product_id: data.product_id,
        status: 'COMPLETED'
      }
    });
    
    if (!order) {
      throw new AppError('You must purchase the product to review it', 403);
    }
    
    const review = await prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return review;
  }
  
  async delete(id: number, userId: number) {
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    
    if (review.user_id !== userId) {
      throw new AppError('Not authorized to delete this review', 403);
    }
    
    await prisma.review.delete({
      where: { id }
    });
  }
}
