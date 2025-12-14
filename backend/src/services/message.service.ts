// ============================================
// 📄 FILENAME: message.service.ts
// 📍 PATH: backend/src/services/message.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class MessageService {
  async getUserConversations(userId: number) {
    // Get unique users the current user has chatted with
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        u.name as other_user_name,
        u.email as other_user_email,
        m.content as last_message,
        m.created_at as last_message_at,
        m.read,
        COUNT(*) FILTER (WHERE m.receiver_id = ${userId} AND m.read = false) as unread_count
      FROM (
        SELECT 
          CASE 
            WHEN sender_id = ${userId} THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          id, content, created_at, read, receiver_id
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ) m
      JOIN users u ON u.id = m.other_user_id
      GROUP BY other_user_id, u.name, u.email, m.content, m.created_at, m.read, m.id
      ORDER BY other_user_id, m.created_at DESC
    `;
    
    return conversations;
  }
  
  async getConversation(userId: number, otherUserId: number) {
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
    
    // Mark messages as read
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
  }) {
    const message = await prisma.message.create({
      data,
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
  
  async markAsRead(messageId: number, userId: number) {
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
