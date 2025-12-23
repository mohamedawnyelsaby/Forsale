"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_service_1 = require("../services/message.service");
const AppError_1 = require("../utils/AppError");
const messageService = new message_service_1.MessageService();
class MessageController {
    async getConversations(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const conversations = await messageService.getUserConversations(req.user.id);
            res.json({
                success: true,
                data: conversations
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getConversationWith(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const otherUserId = parseInt(req.params.userId);
            const messages = await messageService.getConversation(req.user.id, otherUserId);
            res.json({
                success: true,
                data: messages
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
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
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            await messageService.markAsRead(parseInt(req.params.id), req.user.id);
            res.json({
                success: true,
                message: 'Message marked as read'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MessageController = MessageController;
//# sourceMappingURL=message.controller.js.map