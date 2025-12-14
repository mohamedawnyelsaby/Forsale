// ============================================
// 📄 FILENAME: review.validator.ts
// 📍 PATH: backend/src/validators/review.validator.ts
// ============================================

import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    product_id: z.number().positive(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
  })
});
