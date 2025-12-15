// ============================================
// 📄 FILENAME: order.routes.ts
// 📍 PATH: backend/src/routes/order.routes.ts
// ============================================

import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

router.use(authenticate); // All routes require auth

router.post('/', orderController.create);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getById);
router.put('/:id/status', orderController.updateStatus);
router.post('/:id/confirm-delivery', orderController.confirmDelivery);
router.post('/:id/dispute', orderController.createDispute);

export default router;
