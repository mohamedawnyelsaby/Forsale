// ============================================
// 📄 FILENAME: review.routes.ts
// 📍 PATH: backend/src/routes/review.routes.ts
// ============================================

import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();
const reviewController = new ReviewController();

router.get('/product/:productId', reviewController.getProductReviews);
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  reviewController.create
);
router.delete('/:id', authenticate, reviewController.delete);

export default router;
