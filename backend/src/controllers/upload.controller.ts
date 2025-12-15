// ============================================
// 📄 FILENAME: upload.controller.ts
// 📍 PATH: backend/src/controllers/upload.controller.ts
// ============================================

import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { AppError } from '../utils/AppError';

const uploadService = new UploadService();

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }
      
      const url = await uploadService.uploadImage(req.file);
      
      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        throw new AppError('No files provided', 400);
      }
      
      const urls = await uploadService.uploadMultipleImages(req.files);
      
      res.json({
        success: true,
        data: { urls }
      });
    } catch (error) {
      next(error);
    }
  }
}
