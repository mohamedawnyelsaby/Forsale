// ============================================
// 📄 FILENAME: upload.routes.ts
// 📍 PATH: backend/src/routes/upload.routes.ts
// ============================================

import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const uploadController = new UploadController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post(
  '/image',
  authenticate,
  upload.single('image'),
  uploadController.uploadImage
);

router.post(
  '/images',
  authenticate,
  upload.array('images', 10),
  uploadController.uploadMultipleImages
);

export default router;
