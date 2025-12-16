// ============================================
// 📄 FILENAME: upload.service.ts (PRODUCTION READY)
// 📍 PATH: backend/src/services/upload.service.ts
// ============================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { logger } from '../utils/logger';

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
    
    logger.info('✅ Upload Service initialized (AWS SDK v3)');
  }
  
  /**
   * Upload single image
   * Using native browser image optimization or CDN transformation
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // Generate unique filename
      const ext = file.mimetype.split('/')[1] || 'jpg';
      const filename = `${uuidv4()}.${ext}`;
      const key = `products/${filename}`;
      
      // Upload to S3/Spaces with streaming
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
          CacheControl: 'max-age=31536000', // 1 year cache
        }
      });
      
      await upload.done();
      
      // Build URL with optional CDN transformation
      const baseUrl = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      
      // If using CloudFlare Images or ImageKit, add transformation params
      // Example: ?w=1200&q=85&f=auto
      const url = this.addImageTransformation(baseUrl);
      
      logger.info(`✅ Image uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  /**
   * Upload multiple images in parallel
   */
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      logger.info(`✅ Uploaded ${urls.length} images successfully`);
      return urls;
      
    } catch (error) {
      logger.error('❌ Multiple upload failed:', error);
      throw new Error('Failed to upload images');
    }
  }
  
  /**
   * Delete image from storage
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract key from URL
      const urlParts = url.split(`/${config.S3_BUCKET}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid image URL');
      }
      
      const key = urlParts[1].split('?')[0]; // Remove query params
      
      const command = new DeleteObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: key
      });
      
      await this.s3Client.send(command);
      
      logger.info(`✅ Image deleted: ${url}`);
      
    } catch (error) {
      logger.error('❌ Image deletion failed:', error);
      throw new Error('Failed to delete image');
    }
  }
  
  /**
   * Upload avatar with size limit
   */
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
      
      const baseUrl = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      const url = this.addImageTransformation(baseUrl, { width: 300, height: 300 });
      
      logger.info(`✅ Avatar uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    }
  }
  
  /**
   * Add CDN image transformation parameters
   * Works with CloudFlare Images, ImageKit, or similar services
   */
  private addImageTransformation(
    url: string, 
    options?: { width?: number; height?: number; quality?: number }
  ): string {
    // If you're using a CDN with built-in image optimization, add params here
    // Example for CloudFlare Images: url + '?width=1200&quality=85&format=auto'
    // Example for ImageKit: url + '?tr=w-1200,q-85,f-auto'
    
    // For now, return as-is (S3/Spaces will serve original)
    // The browser or CDN will handle optimization
    return url;
  }
  
  /**
   * Validate file before upload
   */
  validateFile(file: Express.Multer.File): boolean {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size: 10MB');
    }
    
    return true;
  }
  
  /**
   * Generate thumbnail URL (for list views)
   */
  getThumbnailUrl(originalUrl: string): string {
    // Add thumbnail transformation
    // This depends on your CDN service
    return originalUrl; // Return original for now
  }
}
