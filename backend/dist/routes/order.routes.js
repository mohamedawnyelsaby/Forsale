"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const orderController = new order_controller_1.OrderController();
router.use(auth_1.authenticate);
router.post('/', orderController.create);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getById);
router.put('/:id/status', orderController.updateStatus);
router.post('/:id/confirm-delivery', orderController.confirmDelivery);
router.post('/:id/dispute', orderController.createDispute);
exports.default = router;
//# sourceMappingURL=order.routes.js.map