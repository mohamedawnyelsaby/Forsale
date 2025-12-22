// ============================================
// 📄 FILENAME: pi.controller.ts (SECURED)
// 📍 PATH: backend/src/controllers/pi.controller.ts
// ✅ جاهز لاجتياز Step 10 في Pi Network
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PiService } from '../services/pi.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const piService = new PiService();

export class PiController {
  
  /**
   * ✅ إنشاء دفعة جديدة
   */
  async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const { productId, amount, memo } = req.body;
      
      // التحقق من صحة البيانات
      if (!productId || !amount || amount <= 0) {
        throw new AppError('Invalid payment data', 400);
      }
      
      // التحقق من المنتج والسعر
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      if (product.price !== amount) {
        throw new AppError('Price mismatch', 400);
      }
      
      // إنشاء الدفعة
      const payment = await piService.createPayment({
        amount,
        memo: memo || `Purchase: ${product.name}`,
        metadata: {
          productId,
          userId: req.user.id,
          expectedAmount: amount, // ✅ حفظ المبلغ المتوقع
          timestamp: Date.now()
        }
      });
      
      // إنشاء Order
      await prisma.order.create({
        data: {
          user_id: req.user.id,
          product_id: productId,
          quantity: 1,
          total_price: amount,
          payment_id: payment.identifier,
          status: 'PENDING'
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
  
  /**
   * ✅ الموافقة على الدفع (Server-side)
   */
  async approvePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      // 1. الحصول على تفاصيل الدفع من Pi
      const payment = await piService.getPayment(paymentId);
      
      // 2. التحقق من حالة الدفع
      if (payment.status !== 'pending') {
        throw new AppError('Payment not pending', 400);
      }
      
      // 3. العثور على الطلب
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId },
        include: { product: true }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      // 4. التحقق من المبلغ (CRITICAL!)
      const expectedAmount = parseFloat(order.total_price.toString());
      const paidAmount = payment.amount;
      
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        logger.error(`Amount mismatch: expected ${expectedAmount}, got ${paidAmount}`);
        throw new AppError('Payment amount mismatch', 400);
      }
      
      // 5. التحقق من المخزون
      if (order.product.stock < order.quantity) {
        await piService.cancelPayment(paymentId);
        throw new AppError('Product out of stock', 400);
      }
      
      // 6. الموافقة على الدفع
      await piService.approvePayment(paymentId);
      
      // 7. تحديث حالة الطلب
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
  
  /**
   * ✅ إكمال الدفع - الخطوة الأهم!
   * هذه الدالة تُستدعى من Pi Network Webhook
   */
  async completePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, txid } = req.body;
      
      if (!paymentId || !txid) {
        throw new AppError('Missing required fields', 400);
      }
      
      // 1. التحقق من عدم معالجة نفس المعاملة مرتين (Replay Attack)
      const existingOrder = await prisma.order.findFirst({
        where: { 
          payment_id: paymentId,
          txid: { not: null }
        }
      });
      
      if (existingOrder) {
        logger.warn(`⚠️ Duplicate completion attempt for ${paymentId}`);
        return res.json({ success: true, message: 'Already processed' });
      }
      
      // 2. الحصول على تفاصيل الدفع من Pi Network
      const payment = await piService.getPayment(paymentId);
      
      // 3. التحقق من حالة الدفع على Pi Network
      if (payment.status !== 'completed') {
        throw new AppError('Payment not completed on Pi Network', 400);
      }
      
      // 4. التحقق من TXID
      if (payment.transaction?.txid !== txid) {
        logger.error(`TXID mismatch: expected ${payment.transaction?.txid}, got ${txid}`);
        throw new AppError('Invalid transaction ID', 400);
      }
      
      // 5. العثور على الطلب
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId },
        include: { product: true }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      // 6. التحقق من المبلغ النهائي
      const expectedAmount = parseFloat(order.total_price.toString());
      const paidAmount = payment.amount;
      
      if (Math.abs(paidAmount - expectedAmount) > 0.01) {
        logger.error(`Final amount mismatch: ${expectedAmount} vs ${paidAmount}`);
        throw new AppError('Payment amount verification failed', 400);
      }
      
      // 7. إكمال الدفع على Pi Network (Release Escrow)
      await piService.completePayment(paymentId, txid);
      
      // 8. تحديث الطلب والمخزون في Transaction
      await prisma.$transaction(async (tx) => {
        // تحديث الطلب
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'COMPLETED',
            txid,
            updated_at: new Date()
          }
        });
        
        // خصم المخزون
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
  
  /**
   * ✅ إلغاء الدفع
   */
  async cancelPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      // إلغاء الدفع على Pi Network
      await piService.cancelPayment(paymentId);
      
      // تحديث حالة الطلب
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
  
  /**
   * ✅ Webhook من Pi Network - الأهم للخطوة 10!
   */
  async paymentCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, txid, signature } = req.body;
      
      logger.info(`📥 Webhook received: ${paymentId}`);
      
      // 1. التحقق من وجود كل البيانات المطلوبة
      if (!paymentId || !txid || !signature) {
        throw new AppError('Missing webhook data', 400);
      }
      
      // 2. التحقق من التوقيع (CRITICAL!)
      const isValid = piService.verifyPaymentCallback(paymentId, txid, signature);
      
      if (!isValid) {
        logger.error(`❌ Invalid webhook signature for ${paymentId}`);
        throw new AppError('Invalid signature', 403);
      }
      
      // 3. التحقق من عدم معالجة نفس الـ Webhook مرتين
      const existingOrder = await prisma.order.findFirst({
        where: { 
          payment_id: paymentId,
          txid: { not: null }
        }
      });
      
      if (existingOrder) {
        logger.info(`ℹ️ Webhook already processed: ${paymentId}`);
        return res.json({ success: true });
      }
      
      // 4. استخدام الـ Webhook Handler الآمن
      const verified = await piService.handleWebhook({ paymentId, txid, signature });
      
      if (!verified) {
        throw new AppError('Webhook verification failed', 400);
      }
      
      // 5. تحديث الطلب
      await prisma.order.updateMany({
        where: { payment_id: paymentId },
        data: { 
          txid,
          updated_at: new Date()
        }
      });
      
      logger.info(`✅ Webhook processed successfully: ${paymentId}`);
      
      // ✅ يجب إرجاع 200 OK دائماً لـ Pi Network
      res.json({ success: true });
      
    } catch (error) {
      logger.error('❌ Webhook processing failed:', error);
      
      // ⚠️ حتى في حالة الخطأ، نرجع 200 لمنع إعادة المحاولة
      res.status(200).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
