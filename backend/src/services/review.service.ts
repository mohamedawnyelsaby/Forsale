// ============================================
// 📄 FILENAME: review.service.ts (FIXED)
// 📍 PATH: backend/src/services/review.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class ReviewService {
  async getProductReviews(productId: number): Promise<any> {
    const reviews = await prisma.review.findMany({
      where: { product_id: productId },
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
    });
    
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
  }): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: data.product_id }
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const existing = await prisma.review.findFirst({
      where: {
        reviewer_id: data.user_id,
        product_id: data.product_id
      }
    });
    
    if (existing) {
      throw new AppError('You have already reviewed this product', 400);
    }
    
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
      data: {
        reviewer_id: data.user_id,
        reviewee_id: product.seller_id,
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return review;
  }
  
  async delete(id: number, userId: number): Promise<void> {
    const review = await prisma.review.findUnique({
      where: { id }
    });
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    
    if (review.reviewer_id !== userId) {
      throw new AppError('Not authorized to delete this review', 403);
    }
    
    await prisma.review.delete({
      where: { id }
    });
  }
}
