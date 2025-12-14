// ============================================
// 📄 FILENAME: product.validator.ts
// 📍 PATH: backend/src/validators/product.validator.ts
// ============================================

import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    price_pi: z.number().positive('Price must be positive'),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0).optional()
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    price_pi: z.number().positive().optional(),
    category: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    stock: z.number().int().min(0).optional()
  })
});
