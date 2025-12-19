// ============================================
// 📄 FILENAME: pi.controller.ts
// 📍 PATH: backend/src/controllers/pi.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PiService } from '../services/pi.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { prisma } from '../config/database';

const piService = new PiService();

export class PiController {
  async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const { productId, amount, memo } = req.body;
      
      const payment = await piService.createPayment({
        amount,
        memo,
        metadata: {
          productId,
          userId: req.user.id
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
  
  async approvePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      
      // Get payment details from Pi
      const payment = await piService.getPayment(paymentId);
      
      // Update order status
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      // Approve the payment
      await piService.approvePayment(paymentId);
      
      // Update order
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' }
      });
      
      res.json({
        success: true,
        message: 'Payment approved'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async completePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, txid } = req.body;
      
      const order = await prisma.order.findFirst({
        where: { payment_id: paymentId }
      });
      
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      
      // Complete payment (release escrow)
      await piService.completePayment(paymentId, txid);
      
      // Update order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          txid
        }
      });
      
      // Update product stock
      await prisma.product.update({
        where: { id: order.product_id },
        data: {
          stock: {
            decrement: order.quantity
          }
        }
      });
      
      res.json({
        success: true,
        message: 'Payment completed'
      });
    } catch (error) {
      next(error);
    }
  }
  
  async cancelPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.body;
      
      await piService.cancelPayment(paymentId);
      
      // Update order
      await prisma.order.updateMany({
        where: { payment_id: paymentId },
        data: { status: 'CANCELLED' }
      });
      
      res.json({
        success: true,
        message: 'Payment cancelled'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Webhook callback from Pi Network
   */
  async paymentCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, txid, signature } = req.body;
      
      // Verify signature
      const isValid = piService.verifyPaymentCallback(paymentId, txid, signature);
      
      if (!isValid) {
        throw new AppError('Invalid signature', 400);
      }
      
      // Update order
      await prisma.order.updateMany({
        where: { payment_id: paymentId },
        data: { txid }
      });
      
      res.json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
  
  async initAuth(req: Request, res: Response, next: NextFunction) {
    try {
      // Redirect to Pi OAuth
      const authUrl = `https://authenticate.minepi.com/authorize?client_id=${process.env.PI_APP_ID}&redirect_uri=${process.env.PI_CALLBACK_BASE}/api/pi/auth/callback`;
      
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  }
  
  async authCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.query;
      
      // Exchange code for access token
      // TODO: Implement OAuth token exchange
      
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  }
}
