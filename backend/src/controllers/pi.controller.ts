// ============================================
// 📄 FILENAME: pi.controller.ts (FIXED - PRODUCTION READY)
// 📍 PATH: backend/src/controllers/pi.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PiService } from '../services/pi.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const piService = new PiService();

export class PiController {
  
  async createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const { productId, amount, memo } = req.body;
      
      if (!productId || !amount || amount <= 0) {
        throw new AppError('Invalid payment data', 400);
      }
      
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      if (product.price_pi !== amount) {
        throw new AppError('Price mismatch', 400);
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
      
      await prisma.order.create({
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
      
    } catch (error) {
      next(error);
    }
  }
  
  async approvePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      const payment = await piService.getPayment(paymentId);
      
      if (payment.status !== 'pending') {
        throw new AppError('Payment not pending', 400);
      }
      
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId },
        include: { product: true }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      const expectedAmount = parseFloat(order.total_amount.toString());
      const paidAmount = payment.amount;
      
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        logger.error(`Amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
        throw new AppError('Payment amount mismatch', 400);
      }
      
      if (order.product.stock < order.quantity) {
        await piService.cancelPayment(paymentId);
        throw new AppError('Product out of stock', 400);
      }
      
      await piService.approvePayment(paymentId);
      
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'APPROVED',
          updated_at: new Date()
        }
      });
      
      logger.info(`✅ Payment approved: ${paymentId}`);
      
      res.json({
        success: true,
        message: 'Payment approved successfully'
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  async completePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, txid } = req.body;
      
      if (!paymentId || !txid) {
        throw new AppError('Missing required fields', 400);
      }
      
      const existingOrder = await prisma.order.findFirst({
        where: { 
          payment_id: paymentId,
          txid: { not: null }
        }
      });
      
      if (existingOrder) {
        logger.warn(`⚠️ Duplicate completion attempt for ${paymentId}`);
        res.json({ success: true, message: 'Already processed' });
        return;
      }
      
      const payment = await piService.getPayment(paymentId);
      
      if (payment.status !== 'completed') {
        throw new AppError('Payment not completed on Pi Network', 400);
      }
      
      if (payment.transaction?.txid !== txid) {
        logger.error(`TXID mismatch: expected ${payment.transaction?.txid}, got ${txid}`);
        throw new AppError('Invalid transaction ID', 400);
      }
      
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId },
        include: { product: true }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      const expectedAmount = parseFloat(order.total_amount.toString());
      const paidAmount = payment.amount;
      
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        logger.error(`Final amount mismatch: ${expectedAmount} vs ${paidAmount}`);
        throw new AppError('Payment amount verification failed', 400);
      }
      
      await piService.completePayment(paymentId, txid);
      
      await prisma.$transaction(async (tx) => {
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
      
      logger.info(`✅ Payment completed successfully: ${paymentId} | TXID: ${txid}`);
      
      res.json({
        success: true,
        message: 'Payment completed successfully'
      });
      
    } catch (error) {
      logger.error(`❌ Payment completion failed:`, error);
      next(error);
    }
  }
  
  async cancelPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      await piService.cancelPayment(paymentId);
      
      await prisma.order.updateMany({
        where: { payment_id: paymentId },
        data: { 
          status: 'CANCELLED',
          updated_at: new Date()
        }
      });
      
      logger.info(`✅ Payment cancelled: ${paymentId}`);
      
      res.json({
        success: true,
        message: 'Payment cancelled successfully'
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  async paymentCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentId, txid, signature } = req.body;
      
      logger.info(`📥 Webhook received: ${paymentId}`);
      
      if (!paymentId || !txid || !signature) {
        throw new AppError('Missing webhook data', 400);
      }
      
      const isValid = piService.verifyPaymentCallback(paymentId, txid, signature);
      
      if (!isValid) {
        logger.error(`❌ Invalid webhook signature for ${paymentId}`);
        throw new AppError('Invalid signature', 403);
      }
      
      const existingOrder = await prisma.order.findFirst({
        where: { 
          payment_id: paymentId,
          txid: { not: null }
        }
      });
      
      if (existingOrder) {
        logger.info(`ℹ️ Webhook already processed: ${paymentId}`);
        res.json({ success: true });
        return;
      }
      
      const verified = await piService.handleWebhook({ paymentId, txid, signature });
      
      if (!verified) {
        throw new AppError('Webhook verification failed', 400);
      }
      
      await prisma.order.updateMany({
        where: { payment_id: paymentId },
        data: { 
          txid,
          updated_at: new Date()
        }
      });
      
      logger.info(`✅ Webhook processed successfully: ${paymentId}`);
      
      res.json({ success: true });
      
    } catch (error) {
      logger.error('❌ Webhook processing failed:', error);
      
      res.status(200).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
