"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
const AppError_1 = require("../utils/AppError");
const reviewService = new review_service_1.ReviewService();
class ReviewController {
    async getProductReviews(req, res, next) {
        try {
            const productId = parseInt(req.params.productId);
            const reviews = await reviewService.getProductReviews(productId);
            res.json({
                success: true,
                data: reviews
            });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
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
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            await reviewService.delete(parseInt(req.params.id), req.user.id);
            res.json({
                success: true,
                message: 'Review deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=review.controller.js.map