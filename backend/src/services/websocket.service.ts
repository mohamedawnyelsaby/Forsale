// ============================================
// 📄 FILENAME: websocket.service.ts
// 📍 PATH: backend/src/services/websocket.service.ts
// ============================================

import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketServer;
  private userSockets: Map<number, string> = new Map();
  
  constructor(server: Server) {
    this.io = new SocketServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true
      }
    });
    
    this.setupMiddleware();
    this.setupHandlers();
  }
  
  private setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }
        
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user.id;
      this.userSockets.set(userId, socket.id);
      
      logger.info(`User ${userId} connected`);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
      
      // Handle incoming messages
      socket.on('send_message', async (data) => {
        try {
          await this.handleSendMessage(socket, data);
        } catch (error) {
          logger.error('Message send error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
      
      // Handle typing indicator
      socket.on('typing', (data) => {
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
          this.io.to(receiverSocketId).emit('user_typing', {
            userId,
            isTyping: data.isTyping
          });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.userSockets.delete(userId);
        logger.info(`User ${userId} disconnected`);
      });
    });
  }
  
  private async handleSendMessage(socket: any, data: {
    receiverId: number;
    content: string;
  }) {
    const senderId = socket.data.user.id;
    
    // Save message to database
    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: data.receiverId,
        content: data.content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Send to sender (confirmation)
    socket.emit('message_sent', message);
    
    // Send to receiver (if online)
    const receiverSocketId = this.userSockets.get(data.receiverId);
    if (receiverSocketId) {
      this.io.to(receiverSocketId).emit('new_message', message);
    } else {
      // Send push notification
      await this.sendNotification(data.receiverId, {
        type: 'new_message',
        title: 'New Message',
        message: `${socket.data.user.name} sent you a message`,
        data: { messageId: message.id }
      });
    }
  }
  
  private async sendNotification(userId: number, notification: any) {
    await prisma.notification.create({
      data: {
        user_id: userId,
        ...notification
      }
    });
    
    // Emit to user if online
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }
  
  /**
   * Send real-time notification to user
   */
  async notifyUser(userId: number, notification: any) {
    await this.sendNotification(userId, notification);
  }
  
  /**
   * Broadcast order update
   */
  async notifyOrderUpdate(orderId: number, update: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            seller: true
          }
        }
      }
    });
    
    if (!order) return;
    
    // Notify buyer
    const buyerSocketId = this.userSockets.get(order.buyer_id);
    if (buyerSocketId) {
      this.io.to(buyerSocketId).emit('order_update', {
        orderId,
        ...update
      });
    }
    
    // Notify seller
    const sellerSocketId = this.userSockets.get(order.product.seller_id);
    if (sellerSocketId) {
      this.io.to(sellerSocketId).emit('order_update', {
        orderId,
        ...update
      });
    }
  }
}
