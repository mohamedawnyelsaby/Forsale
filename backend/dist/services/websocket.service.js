"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
class WebSocketService {
    io;
    userSockets = new Map();
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: env_1.config.CORS_ORIGIN,
                credentials: true
            }
        });
        this.setupMiddleware();
        this.setupHandlers();
    }
    setupMiddleware() {
        this.io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
                socket.data.user = decoded;
                next();
            }
            catch (error) {
                next(new Error('Invalid token'));
            }
        });
    }
    setupHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.data.user.id;
            this.userSockets.set(userId, socket.id);
            logger_1.logger.info(`User ${userId} connected`);
            socket.join(`user:${userId}`);
            socket.on('send_message', async (data) => {
                try {
                    await this.handleSendMessage(socket, data);
                }
                catch (error) {
                    logger_1.logger.error('Message send error:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });
            socket.on('typing', (data) => {
                const receiverSocketId = this.userSockets.get(data.receiverId);
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('user_typing', {
                        userId,
                        isTyping: data.isTyping
                    });
                }
            });
            socket.on('disconnect', () => {
                this.userSockets.delete(userId);
                logger_1.logger.info(`User ${userId} disconnected`);
            });
        });
    }
    async handleSendMessage(socket, data) {
        const senderId = socket.data.user.id;
        const message = await database_1.prisma.message.create({
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
        socket.emit('message_sent', message);
        const receiverSocketId = this.userSockets.get(data.receiverId);
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('new_message', message);
        }
        else {
            await this.sendNotification(data.receiverId, {
                type: 'new_message',
                title: 'New Message',
                message: `${socket.data.user.name} sent you a message`,
                data: { messageId: message.id }
            });
        }
    }
    async sendNotification(userId, notification) {
        await database_1.prisma.notification.create({
            data: {
                user_id: userId,
                ...notification
            }
        });
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification', notification);
        }
    }
    async notifyUser(userId, notification) {
        await this.sendNotification(userId, notification);
    }
    async notifyOrderUpdate(orderId, update) {
        const order = await database_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                product: {
                    include: {
                        seller: true
                    }
                }
            }
        });
        if (!order)
            return;
        const buyerSocketId = this.userSockets.get(order.buyer_id);
        if (buyerSocketId) {
            this.io.to(buyerSocketId).emit('order_update', {
                orderId,
                ...update
            });
        }
        const sellerSocketId = this.userSockets.get(order.product.seller_id);
        if (sellerSocketId) {
            this.io.to(sellerSocketId).emit('order_update', {
                orderId,
                ...update
            });
        }
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=websocket.service.js.map