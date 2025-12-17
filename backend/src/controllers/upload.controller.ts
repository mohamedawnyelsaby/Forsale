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
      
      uploadService.validateFile(req.file);
      
      const url = await uploadService.uploadImage(req.file);
      
      res.json({
        success: true,
        data: { 
          url,
          thumbnail: uploadService.getThumbnailUrl(url),
          size: req.file.size,
          type: req.file.mimetype
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No files provided', 400);
      }
      
      req.files.forEach(file => uploadService.validateFile(file));
      
      const urls = await uploadService.uploadMultipleImages(req.files);
      
      res.json({
        success: true,
        data: { 
          urls,
          count: urls.length,
          thumbnails: urls.map(url => uploadService.getThumbnailUrl(url))
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No file provided', 400);
      }
      
      uploadService.validateFile(req.file);
      
      const url = await uploadService.uploadAvatar(req.file);
      
      res.json({
        success: true,
        data: { url }
      });
    } catch (error) {
      next(error);
    }
  }
  
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { url } = req.body;
      
      if (!url) {
        throw new AppError('Image URL is required', 400);
      }
      
      await uploadService.deleteImage(url);
      
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
