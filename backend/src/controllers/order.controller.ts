// ============================================
// 📄 FILENAME: order.controller.ts (FIXED)
// 📍 PATH: backend/src/controllers/order.controller.ts
// ============================================

import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const orderService = new OrderService();

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const order = await orderService.create({
        buyer_id: req.user.id,
        product_id: req.body.product_id,
        quantity: req.body.quantity || 1
      });
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const orders = await orderService.getUserOrders(req.user.id);
      
      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const order = await orderService.getById(
        parseInt(req.params.id),
        req.user.id
      );
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const order = await orderService.updateStatus(
        parseInt(req.params.id),
        req.user.id,
        req.body.status
      );
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
  
  async confirmDelivery(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const order = await orderService.confirmDelivery(
        parseInt(req.params.id),
        req.user.id
      );
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
  
  async createDispute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const dispute = await orderService.createDispute(
        parseInt(req.params.id),
        req.user.id,
        req.body
      );
      
      res.status(201).json({
        success: true,
        data: dispute
      });
    } catch (error) {
      next(error);
    }
  }
}
