"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
class ReviewService {
    async getProductReviews(productId) {
        const reviews = await database_1.prisma.review.findMany({
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
    async create(data) {
        const product = await database_1.prisma.product.findUnique({
            where: { id: data.product_id }
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        const existing = await database_1.prisma.review.findFirst({
            where: {
                reviewer_id: data.user_id,
                product_id: data.product_id
            }
        });
        if (existing) {
            throw new AppError_1.AppError('You have already reviewed this product', 400);
        }
        const order = await database_1.prisma.order.findFirst({
            where: {
                buyer_id: data.user_id,
                product_id: data.product_id,
                status: 'COMPLETED'
            }
        });
        if (!order) {
            throw new AppError_1.AppError('You must purchase the product to review it', 403);
        }
        const review = await database_1.prisma.review.create({
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
    async delete(id, userId) {
        const review = await database_1.prisma.review.findUnique({
            where: { id }
        });
        if (!review) {
            throw new AppError_1.AppError('Review not found', 404);
        }
        if (review.reviewer_id !== userId) {
            throw new AppError_1.AppError('Not authorized to delete this review', 403);
        }
        await database_1.prisma.review.delete({
            where: { id }
        });
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=review.service.js.map