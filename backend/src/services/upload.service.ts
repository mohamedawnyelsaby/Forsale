// ============================================
// 📄 FILENAME: upload.service.ts (FIXED)
// 📍 PATH: backend/src/services/upload.service.ts
// ============================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export class UploadService {
  private s3Client: S3Client;
  
  constructor() {
    this.s3Client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: config.S3_KEY,
        secretAccessKey: config.S3_SECRET
      },
      forcePathStyle: true
    });
    
    logger.info('✅ Upload Service initialized');
  }
  
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const ext = file.mimetype.split('/')[1] || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      const key = `products/${filename}`;
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          CacheControl: 'max-age=31536000',
        }
      });
      
      await upload.done();
      
      const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      
      logger.info(`✅ Image uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Image upload failed:', error);
      throw new AppError('Failed to upload image', 500);
    }
  }
  
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      logger.info(`✅ Uploaded ${urls.length} images`);
      return urls;
      
    } catch (error) {
      logger.error('❌ Multiple upload failed:', error);
      throw new AppError('Failed to upload images', 500);
    }
  }
  
  async deleteImage(url: string): Promise<void> {
    try {
      const urlParts = url.split(`/${config.S3_BUCKET}/`);
      if (urlParts.length < 2) {
        throw new AppError('Invalid image URL', 400);
      }
      
      const key = urlParts[1].split('?')[0];
      
      const command = new DeleteObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key
      });
      
      await this.s3Client.send(command);
      
      logger.info(`✅ Image deleted: ${url}`);
      
    } catch (error) {
      logger.error('❌ Image deletion failed:', error);
      throw new AppError('Failed to delete image', 500);
    }
  }
  
  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    try {
      const ext = file.mimetype.split('/')[1] || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      const key = `avatars/${filename}`;
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          CacheControl: 'max-age=31536000',
        }
      });
      
      await upload.done();
      
      const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      
      logger.info(`✅ Avatar uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Avatar upload failed:', error);
      throw new AppError('Failed to upload avatar', 500);
    }
  }
  
  validateFile(file: Express.Multer.File): boolean {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg'
    ];
    
    const maxSize = 10 * 1024 * 1024;
    
    if (!allowedMimes.includes(file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }
    
    if (file.size > maxSize) {
      throw new AppError('File too large', 400);
    }
    
    return true;
  }
  
  getThumbnailUrl(originalUrl: string): string {
    return originalUrl;
  }
}
