// ============================================
// 📄 FILENAME: pi.routes.ts
// 📍 PATH: backend/src/routes/pi.routes.ts
// ============================================

import { Router } from 'express';
import { PiController } from '../controllers/pi.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const piController = new PiController();

// Payment routes
router.post('/create-payment', authenticate, piController.createPayment);
router.post('/approve-payment', piController.approvePayment);
router.post('/complete-payment', piController.completePayment);
router.post('/cancel-payment', authenticate, piController.cancelPayment);

// Webhook callback from Pi Network
router.post('/payment-callback', piController.paymentCallback);

// Pi Auth routes
router.get('/auth', piController.initAuth);
router.get('/auth/callback', piController.authCallback);

export default router;
