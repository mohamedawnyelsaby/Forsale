"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiController = void 0;
const pi_service_1 = require("../services/pi.service");
const AppError_1 = require("../utils/AppError");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
const piService = new pi_service_1.PiService();
class PiController {
    async createPayment(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const { productId, amount, memo } = req.body;
            if (!productId || !amount || amount <= 0) {
                throw new AppError_1.AppError('Invalid payment data', 400);
            }
            const product = await database_1.prisma.product.findUnique({
                where: { id: productId }
            });
            if (!product) {
                throw new AppError_1.AppError('Product not found', 404);
            }
            if (product.price_pi !== amount) {
                throw new AppError_1.AppError('Price mismatch', 400);
            }
            const payment = await piService.createPayment({
                amount,
                memo: memo || `Purchase: ${product.title}`,
                metadata: {
                    productId: String(productId),
                    userId: String(req.user.id),
                    expectedAmount: amount,
                    timestamp: Date.now()
                }
            });
            await database_1.prisma.order.create({
                data: {
                    buyer_id: req.user.id,
                    seller_id: product.seller_id,
                    product_id: productId,
                    quantity: 1,
                    amount_pi: amount,
                    total_amount: amount,
                    payment_id: payment.identifier,
                    status: 'CREATED'
                }
            });
            res.json({
                success: true,
                data: payment
            });
        }
        catch (error) {
            next(error);
        }
    }
    async approvePayment(req, res, next) {
        try {
            const { paymentId } = req.body;
            if (!paymentId) {
                throw new AppError_1.AppError('Payment ID required', 400);
            }
            const payment = await piService.getPayment(paymentId);
            if (payment.status !== 'pending') {
                throw new AppError_1.AppError('Payment not pending', 400);
            }
            const order = await database_1.prisma.order.findFirst({
                where: { payment_id: paymentId },
                include: { product: true }
            });
            if (!order) {
                throw new AppError_1.AppError('Order not found', 404);
            }
            const expectedAmount = parseFloat(order.total_amount.toString());
            const paidAmount = payment.amount;
            if (Math.abs(paidAmount - expectedAmount) > 0.01) {
                logger_1.logger.error(`Amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
                throw new AppError_1.AppError('Payment amount mismatch', 400);
            }
            if (order.product.stock < order.quantity) {
                await piService.cancelPayment(paymentId);
                throw new AppError_1.AppError('Product out of stock', 400);
            }
            await piService.approvePayment(paymentId);
            await database_1.prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'APPROVED',
                    updated_at: new Date()
                }
            });
            logger_1.logger.info(`✅ Payment approved: ${paymentId}`);
            res.json({
                success: true,
                message: 'Payment approved successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async completePayment(req, res, next) {
        try {
            const { paymentId, txid } = req.body;
            if (!paymentId || !txid) {
                throw new AppError_1.AppError('Missing required fields', 400);
            }
            const existingOrder = await database_1.prisma.order.findFirst({
                where: {
                    payment_id: paymentId,
                    txid: { not: null }
                }
            });
            if (existingOrder) {
                logger_1.logger.warn(`⚠️ Duplicate completion attempt for ${paymentId}`);
                res.json({ success: true, message: 'Already processed' });
                return;
            }
            const payment = await piService.getPayment(paymentId);
            if (payment.status !== 'completed') {
                throw new AppError_1.AppError('Payment not completed on Pi Network', 400);
            }
            if (payment.transaction?.txid !== txid) {
                logger_1.logger.error(`TXID mismatch: expected ${payment.transaction?.txid}, got ${txid}`);
                throw new AppError_1.AppError('Invalid transaction ID', 400);
            }
            const order = await database_1.prisma.order.findFirst({
                where: { payment_id: paymentId },
                include: { product: true }
            });
            if (!order) {
                throw new AppError_1.AppError('Order not found', 404);
            }
            const expectedAmount = parseFloat(order.total_amount.toString());
            const paidAmount = payment.amount;
            if (Math.abs(paidAmount - expectedAmount) > 0.01) {
                logger_1.logger.error(`Final amount mismatch: ${expectedAmount} vs ${paidAmount}`);
                throw new AppError_1.AppError('Payment amount verification failed', 400);
            }
            await piService.completePayment(paymentId, txid);
            await database_1.prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'COMPLETED',
                        txid,
                        updated_at: new Date()
                    }
                });
                await tx.product.update({
                    where: { id: order.product_id },
                    data: {
                        stock: {
                            decrement: order.quantity
                        }
                    }
                });
            });
            logger_1.logger.info(`✅ Payment completed successfully: ${paymentId} | TXID: ${txid}`);
            res.json({
                success: true,
                message: 'Payment completed successfully'
            });
        }
        catch (error) {
            logger_1.logger.error(`❌ Payment completion failed:`, error);
            next(error);
        }
    }
    async cancelPayment(req, res, next) {
        try {
            const { paymentId } = req.body;
            if (!paymentId) {
                throw new AppError_1.AppError('Payment ID required', 400);
            }
            await piService.cancelPayment(paymentId);
            await database_1.prisma.order.updateMany({
                where: { payment_id: paymentId },
                data: {
                    status: 'CANCELLED',
                    updated_at: new Date()
                }
            });
            logger_1.logger.info(`✅ Payment cancelled: ${paymentId}`);
            res.json({
                success: true,
                message: 'Payment cancelled successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async paymentCallback(req, res, next) {
        try {
            const { paymentId, txid, signature } = req.body;
            logger_1.logger.info(`📥 Webhook received: ${paymentId}`);
            if (!paymentId || !txid || !signature) {
                throw new AppError_1.AppError('Missing webhook data', 400);
            }
            const isValid = piService.verifyPaymentCallback(paymentId, txid, signature);
            if (!isValid) {
                logger_1.logger.error(`❌ Invalid webhook signature for ${paymentId}`);
                throw new AppError_1.AppError('Invalid signature', 403);
            }
            const existingOrder = await database_1.prisma.order.findFirst({
                where: {
                    payment_id: paymentId,
                    txid: { not: null }
                }
            });
            if (existingOrder) {
                logger_1.logger.info(`ℹ️ Webhook already processed: ${paymentId}`);
                res.json({ success: true });
                return;
            }
            const verified = await piService.handleWebhook({ paymentId, txid, signature });
            if (!verified) {
                throw new AppError_1.AppError('Webhook verification failed', 400);
            }
            await database_1.prisma.order.updateMany({
                where: { payment_id: paymentId },
                data: {
                    txid,
                    updated_at: new Date()
                }
            });
            logger_1.logger.info(`✅ Webhook processed successfully: ${paymentId}`);
            res.json({ success: true });
        }
        catch (error) {
            logger_1.logger.error('❌ Webhook processing failed:', error);
            res.status(200).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.PiController = PiController;
//# sourceMappingURL=pi.controller.js.map