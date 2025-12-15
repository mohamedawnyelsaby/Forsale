// ============================================
// 📄 FILENAME: index.ts
// 📍 PATH: backend/src/routes/index.ts
// ============================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import piRoutes from './pi.routes';
import uploadRoutes from './upload.routes';
import reviewRoutes from './review.routes';
import messageRoutes from './message.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/pi', piRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messages', messageRoutes);

export default router;
