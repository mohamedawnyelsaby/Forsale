// ============================================
// 📄 FILENAME: message.service.ts (FIXED)
// 📍 PATH: backend/src/services/message.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class MessageService {
  async getUserConversations(userId: number): Promise<any[]> {
    const sentMessages = await prisma.message.groupBy({
      by: ['receiver_id'],
      where: { sender_id: userId },
      _max: { created_at: true }
    });

    const receivedMessages = await prisma.message.groupBy({
      by: ['sender_id'],
      where: { receiver_id: userId },
      _max: { created_at: true }
    });

    const userIds = new Set<number>();
    sentMessages.forEach(m => userIds.add(m.receiver_id));
    receivedMessages.forEach(m => userIds.add(m.sender_id));

    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { sender_id: userId, receiver_id: otherUserId },
              { sender_id: otherUserId, receiver_id: userId }
            ]
          },
          orderBy: { created_at: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          }
        });

        const unreadCount = await prisma.message.count({
          where: {
            sender_id: otherUserId,
            receiver_id: userId,
            read: false
          }
        });

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, name: true, email: true }
        });

        return {
          otherUser,
          lastMessage,
          unreadCount
        };
      })
    );

    return conversations.sort((a, b) => {
      const aTime = a.lastMessage?.created_at?.getTime() || 0;
      const bTime = b.lastMessage?.created_at?.getTime() || 0;
      return bTime - aTime;
    });
  }
  
  async getConversation(userId: number, otherUserId: number): Promise<any[]> {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });
    
    await prisma.message.updateMany({
      where: {
        sender_id: otherUserId,
        receiver_id: userId,
        read: false
      },
      data: {
        read: true
      }
    });
    
    return messages;
  }
  
  async sendMessage(data: {
    sender_id: number;
    receiver_id: number;
    content: string;
  }): Promise<any> {
    const conversationId = [data.sender_id, data.receiver_id]
      .sort()
      .join('-');

    const message = await prisma.message.create({
      data: {
        ...data,
        conversation_id: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return message;
  }
  
  async markAsRead(messageId: number, userId: number): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });
    
    if (!message) {
      throw new AppError('Message not found', 404);
    }
    
    if (message.receiver_id !== userId) {
      throw new AppError('Not authorized', 403);
    }
    
    await prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });
  }
}
