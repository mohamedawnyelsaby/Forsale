"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const database_1 = require("../config/database");
const AppError_1 = require("../utils/AppError");
class MessageService {
    async getUserConversations(userId) {
        const sentMessages = await database_1.prisma.message.groupBy({
            by: ['receiver_id'],
            where: { sender_id: userId },
            _max: { created_at: true }
        });
        const receivedMessages = await database_1.prisma.message.groupBy({
            by: ['sender_id'],
            where: { receiver_id: userId },
            _max: { created_at: true }
        });
        const userIds = new Set();
        sentMessages.forEach(m => userIds.add(m.receiver_id));
        receivedMessages.forEach(m => userIds.add(m.sender_id));
        const conversations = await Promise.all(Array.from(userIds).map(async (otherUserId) => {
            const lastMessage = await database_1.prisma.message.findFirst({
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
            const unreadCount = await database_1.prisma.message.count({
                where: {
                    sender_id: otherUserId,
                    receiver_id: userId,
                    read: false
                }
            });
            const otherUser = await database_1.prisma.user.findUnique({
                where: { id: otherUserId },
                select: { id: true, name: true, email: true }
            });
            return {
                otherUser,
                lastMessage,
                unreadCount
            };
        }));
        return conversations.sort((a, b) => {
            const aTime = a.lastMessage?.created_at?.getTime() || 0;
            const bTime = b.lastMessage?.created_at?.getTime() || 0;
            return bTime - aTime;
        });
    }
    async getConversation(userId, otherUserId) {
        const messages = await database_1.prisma.message.findMany({
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
        await database_1.prisma.message.updateMany({
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
    async sendMessage(data) {
        const conversationId = [data.sender_id, data.receiver_id]
            .sort()
            .join('-');
        const message = await database_1.prisma.message.create({
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
    async markAsRead(messageId, userId) {
        const message = await database_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            throw new AppError_1.AppError('Message not found', 404);
        }
        if (message.receiver_id !== userId) {
            throw new AppError_1.AppError('Not authorized', 403);
        }
        await database_1.prisma.message.update({
            where: { id: messageId },
            data: { read: true }
        });
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=message.service.js.map