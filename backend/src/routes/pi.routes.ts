// ============================================
// 📄 FILENAME: pi.routes.ts
// 📍 PATH: backend/src/routes/pi.routes.ts
// 🎯 PURPOSE: Pi Network payment and authentication routes
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { PiController } from '../controllers/pi.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const piController = new PiController();

// ============================================
// 🔐 AUTHENTICATION ROUTES
// ============================================

/**
 * Initialize Pi Network OAuth authentication
 * @route GET /api/pi/auth
 * @access Public
 */
router.get('/auth', (req: Request, res: Response, next: NextFunction) => {
  piController.initAuth(req, res, next);
});

/**
 * Handle Pi Network OAuth callback
 * @route GET /api/pi/auth/callback
 * @access Public
 */
router.get('/auth/callback', (req: Request, res: Response, next: NextFunction) => {
  piController.authCallback(req, res, next);
});

// ============================================
// 💳 PAYMENT ROUTES
// ============================================

/**
 * Create a new Pi payment
 * @route POST /api/pi/create-payment
 * @access Private (requires authentication)
 */
router.post('/create-payment', authenticate, (req: Request, res: Response, next: NextFunction) => {
  piController.createPayment(req, res, next);
});

/**
 * Approve a pending Pi payment
 * @route POST /api/pi/approve-payment
 * @access Public (called by Pi Network)
 */
router.post('/approve-payment', (req: Request, res: Response, next: NextFunction) => {
  piController.approvePayment(req, res, next);
});

/**
 * Complete a Pi payment transaction
 * @route POST /api/pi/complete-payment
 * @access Public (called by Pi Network)
 */
router.post('/complete-payment', (req: Request, res: Response, next: NextFunction) => {
  piController.completePayment(req, res, next);
});

/**
 * Cancel a Pi payment
 * @route POST /api/pi/cancel-payment
 * @access Private (requires authentication)
 */
router.post('/cancel-payment', authenticate, (req: Request, res: Response, next: NextFunction) => {
  piController.cancelPayment(req, res, next);
});

// ============================================
// 🔔 WEBHOOK ROUTES
// ============================================

/**
 * Handle Pi Network payment webhooks/callbacks
 * @route POST /api/pi/payment-callback
 * @access Public (called by Pi Network servers)
 */
router.post('/payment-callback', (req: Request, res: Response, next: NextFunction) => {
  piController.paymentCallback(req, res, next);
});

// ============================================
// 🛡️ ERROR HANDLING
// ============================================

/**
 * Catch-all error handler for Pi routes
 */
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Pi Routes Error]:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error in Pi payment system',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default router;
