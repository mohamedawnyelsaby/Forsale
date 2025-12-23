"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
const pi_service_1 = require("./pi.service");
const ai_service_1 = require("./ai.service");
const piService = new pi_service_1.PiService();
const aiService = new ai_service_1.AIService();
class OrderService {
    async create(data) {
        const product = await database_1.prisma.product.findUnique({
            where: { id: data.product_id }
        });
        if (!product) {
            throw new AppError_1.AppError('Product not found', 404);
        }
        if (product.stock < data.quantity) {
            throw new AppError_1.AppError('Insufficient stock', 400);
        }
        const amount_pi = product.price_pi * data.quantity;
        const payment = await piService.createPayment({
            amount: amount_pi,
            memo: `Order for ${product.title}`,
            metadata: {
                productId: String(product.id),
                userId: String(data.buyer_id),
                expectedAmount: amount_pi,
                timestamp: Date.now()
            }
        });
        const order = await database_1.prisma.order.create({
            data: {
                buyer_id: data.buyer_id,
                seller_id: product.seller_id,
                product_id: data.product_id,
                quantity: data.quantity,
                amount_pi,
                total_amount: amount_pi,
                status: 'CREATED',
                payment_id: payment.identifier
            },
            include: {
                product: true,
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return {
            order,
            payment
        };
    }
    async getUserOrders(userId) {
        return await database_1.prisma.order.findMany({
            where: {
                OR: [
                    { buyer_id: userId },
                    { seller_id: userId }
                ]
            },
            include: {
                product: {
                    include: {
                        seller: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                buyer: {
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
    }
    async getById(id, userId) {
        const order = await database_1.prisma.order.findUnique({
            where: { id },
            include: {
                product: {
                    include: {
                        seller: true
                    }
                },
                buyer: true
            }
        });
        if (!order) {
            throw new AppError_1.AppError('Order not found', 404);
        }
        if (order.buyer_id !== userId && order.seller_id !== userId) {
            throw new AppError_1.AppError('Not authorized to view this order', 403);
        }
        return order;
    }
    async updateStatus(id, userId, status) {
        const order = await this.getById(id, userId);
        if (order.seller_id !== userId) {
            throw new AppError_1.AppError('Only seller can update order status', 403);
        }
        const updated = await database_1.prisma.order.update({
            where: { id },
            data: { status }
        });
        return updated;
    }
    async confirmDelivery(id, userId) {
        const order = await this.getById(id, userId);
        if (order.buyer_id !== userId) {
            throw new AppError_1.AppError('Only buyer can confirm delivery', 403);
        }
        if (order.payment_id && order.txid) {
            await piService.completePayment(order.payment_id, order.txid);
        }
        const updated = await database_1.prisma.order.update({
            where: { id },
            data: {
                status: 'COMPLETED'
            }
        });
        return updated;
    }
    async createDispute(id, userId, data) {
        const order = await this.getById(id, userId);
        const disputeNumber = `DIS${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const dispute = await database_1.prisma.dispute.create({
            data: {
                dispute_number: disputeNumber,
                order_id: id,
                reason: data.reason,
                description: data.description,
                evidence: data.evidence || []
            }
        });
        await database_1.prisma.order.update({
            where: { id },
            data: { status: 'DISPUTED' }
        });
        const aiDecision = await aiService.analyzeDispute({
            order,
            dispute,
            evidence: data.evidence
        });
        return {
            dispute,
            aiDecision
        };
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map