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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg'
    ];
    
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

router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadController.uploadAvatar
);

router.delete(
  '/image',
  authenticate,
  uploadController.deleteImage
);

export default router;
