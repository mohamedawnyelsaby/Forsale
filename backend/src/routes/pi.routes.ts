// ============================================
// 📄 FILENAME: pi.routes.ts
// 📍 PATH: backend/src/routes/pi.routes.ts
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { PiController } from '../controllers/pi.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const piController = new PiController();

// Payment routes
router.post('/create-payment', authenticate, (req: Request, res: Response, next: NextFunction) => {
  piController.createPayment(req, res, next);
});

router.post('/approve-payment', (req: Request, res: Response, next: NextFunction) => {
  piController.approvePayment(req, res, next);
});

router.post('/complete-payment', (req: Request, res: Response, next: NextFunction) => {
  piController.completePayment(req, res, next);
});

router.post('/cancel-payment', authenticate, (req: Request, res: Response, next: NextFunction) => {
  piController.cancelPayment(req, res, next);
});

router.post('/payment-callback', (req: Request, res: Response, next: NextFunction) => {
  piController.paymentCallback(req, res, next);
});

export default router;
