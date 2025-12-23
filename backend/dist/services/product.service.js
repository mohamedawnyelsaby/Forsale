"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
const ai_service_1 = require("./ai.service");
const aiService = new ai_service_1.AIService();
class ProductService {
    async getAll(options) {
        const skip = (options.page - 1) * options.limit;
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
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
            database_1.prisma.product.count({
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
    async getById(id) {
        const product = await database_1.prisma.product.findUnique({
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
            throw new AppError_1.AppError('Product not found', 404);
        }
        await database_1.prisma.productView.create({
            data: {
                product_id: id,
                viewed_at: new Date()
            }
        });
        return product;
    }
    async search(params) {
        const skip = (params.page - 1) * params.limit;
        const where = {
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
            database_1.prisma.product.findMany({
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
            database_1.prisma.product.count({ where })
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
    async getByCategory(category, options) {
        const skip = (options.page - 1) * options.limit;
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
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
            database_1.prisma.product.count({
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
    async create(data) {
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
        const product = await database_1.prisma.product.create({
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
    async update(id, userId, data) {
        const product = await database_1.prisma.product.findUnique({
            where: { id }
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        if (product.seller_id !== userId) {
            throw new AppError_1.AppError('Not authorized to update this product', 403);
        }
        const updated = await database_1.prisma.product.update({
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
    async delete(id, userId) {
        const product = await database_1.prisma.product.findUnique({
            where: { id }
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        if (product.seller_id !== userId) {
            throw new AppError_1.AppError('Not authorized to delete this product', 403);
        }
        await database_1.prisma.product.delete({
            where: { id }
        });
    }
    async getSellerProducts(sellerId) {
        return await database_1.prisma.product.findMany({
            where: {
                seller_id: sellerId
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map