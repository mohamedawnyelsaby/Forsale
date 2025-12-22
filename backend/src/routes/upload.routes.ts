// ============================================
// 📄 FILENAME: upload.routes.ts (FIXED)
// 📍 PATH: backend/src/routes/upload.routes.ts
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
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
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  (req: Request, res: Response, next: NextFunction) => {
    uploadController.uploadImage(req, res, next);
  }
);

router.post(
  '/images',
  authenticate,
  upload.array('images', 10),
  (req: Request, res: Response, next: NextFunction) => {
    uploadController.uploadMultipleImages(req, res, next);
  }
);

router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  (req: Request, res: Response, next: NextFunction) => {
    uploadController.uploadAvatar(req, res, next);
  }
);

router.delete(
  '/image',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    uploadController.deleteImage(req, res, next);
  }
);

export default router;
