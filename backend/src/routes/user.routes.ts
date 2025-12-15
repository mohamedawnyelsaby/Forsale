// ============================================
// 📄 FILENAME: user.routes.ts
// 📍 PATH: backend/src/routes/user.routes.ts
// ============================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, (req: any, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

export default router;
