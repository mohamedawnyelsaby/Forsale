"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const AppError_1 = require("../utils/AppError");
const orderService = new order_service_1.OrderService();
class OrderController {
    async create(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
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
        }
        catch (error) {
            next(error);
        }
    }
    async getMyOrders(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const orders = await orderService.getUserOrders(req.user.id);
            res.json({
                success: true,
                data: orders
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const order = await orderService.getById(parseInt(req.params.id), req.user.id);
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const order = await orderService.updateStatus(parseInt(req.params.id), req.user.id, req.body.status);
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    }
    async confirmDelivery(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const order = await orderService.confirmDelivery(parseInt(req.params.id), req.user.id);
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createDispute(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError('Authentication required', 401);
            }
            const dispute = await orderService.createDispute(parseInt(req.params.id), req.user.id, req.body);
            res.status(201).json({
                success: true,
                data: dispute
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map