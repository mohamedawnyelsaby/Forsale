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
router.post('/approve-payment', (
