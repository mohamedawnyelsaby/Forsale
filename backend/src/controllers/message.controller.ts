// ============================================
// 📄 FILENAME: message.controller.ts
// 📍 PATH: backend/src/controllers/message.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const messageService = new MessageService();

export class MessageController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const conversations = await messageService.getUserConversations(req.user.id);
      
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }
  
  async getConversationWith(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const otherUserId = parseInt(req.params.userId);
      const messages = await messageService.getConversation(
        req.user.id,
        otherUserId
      );
      
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }
  
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      const message = await messageService.sendMessage({
        sender_id: req.user.id,
        receiver_id: req.body.receiverId,
        content: req.body.content
      });
      
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }
  
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }
      
      await messageService.markAsRead(
        parseInt(req.params.id),
        req.user.id
      );
      
      res.json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}
