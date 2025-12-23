"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
const AppError_1 = require("../utils/AppError");
const database_1 = require("../config/database");
const ai_service_1 = require("../services/ai.service");
const productService = new product_service_1.ProductService();
const aiService = new ai_service_1.AIService();
class ProductController {
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await productService.getAll({ page, limit });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { q, category, minPrice, maxPrice, condition, location, brand, sortBy = 'newest', page = 1, limit = 20 } = req.query;
            const where = {
                stock: { gt: 0 }
            };
            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } }
                ];
            }
            if (category && category !== 'all') {
                where.category = category;
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price_pi = {};
                if (minPrice !== undefined) {
                    where.price_pi.gte = parseFloat(minPrice);
                }
                if (maxPrice !== undefined) {
                    where.price_pi.lte = parseFloat(maxPrice);
                }
            }
            let orderBy = { created_at: 'desc' };
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
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const [products, total] = await Promise.all([
                database_1.prisma.product.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
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
                database_1.prisma.product.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
        }
        catch (error) {
            console.error('Search error:', error);
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const product = await productService.getById(parseInt(req.params.id));
            res.json({
                success: true,
                data: product
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getByCategory(req, res, next) {
        try {
            const { category } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await productService.getByCategory(category, { page, limit });
            res.json({
                success: true,
                data: result
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
            const product = await productService.create({
                ...req.body,
                seller_id: req.user.id
            });
            res.status(201).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const product = await productService.update(parseInt(req.params.id), req.user.id, req.body);
            res.json({
                success: true,
                data: product
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
            await productService.delete(parseInt(req.params.id), req.user.id);
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMyProducts(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const products = await productService.getSellerProducts(req.user.id);
            res.json({
                success: true,
                data: products
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map