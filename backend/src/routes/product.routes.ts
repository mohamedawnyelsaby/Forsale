// ============================================
// 📄 FILENAME: product.routes.ts
// 📍 PATH: backend/src/routes/product.routes.ts
// ============================================

import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const productController = new ProductController();

// Public routes
router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/category/:category', productController.getByCategory);
router.get('/:id', productController.getById);

// Protected routes
router.post(
  '/',
  authenticate,
  validate(createProductSchema),
  productController.create
);

router.put(
  '/:id',
  authenticate,
  validate(updateProductSchema),
  productController.update
);

router.delete('/:id', authenticate, productController.delete);

// Seller routes
router.get('/seller/me', authenticate, productController.getMyProducts);

export default router;
