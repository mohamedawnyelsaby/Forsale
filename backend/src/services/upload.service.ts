// ============================================
// 📄 FILENAME: upload.service.ts (AWS SDK v3)
// 📍 PATH: backend/src/services/upload.service.ts
// ============================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class UploadService {
  private s3Client: S3Client;
  
  constructor() {
    // تهيئة S3 Client الجديد
    this.s3Client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: 'auto', // للـ DigitalOcean Spaces
      credentials: {
        accessKeyId: config.S3_KEY,
        secretAccessKey: config.S3_SECRET
      },
      forcePathStyle: true // مهم لـ DigitalOcean Spaces
    });
    
    logger.info('✅ AWS SDK v3 initialized successfully');
  }
  
  /**
   * رفع صورة واحدة
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // تحسين الصورة
      const optimized = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // اسم الملف الفريد
      const filename = `${uuidv4()}.jpg`;
      const key = `products/${filename}`;
      
      // رفع باستخدام AWS SDK v3
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: optimized,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        }
      });
      
      // انتظار اكتمال الرفع
      await upload.done();
      
      // بناء URL الصورة
      const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      
      logger.info(`✅ Image uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }
  
  /**
   * رفع صور متعددة
   */
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      // رفع جميع الصور بالتوازي
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
   * حذف صورة
   */
  async deleteImage(url: string): Promise<void> {
    try {
      // استخراج المفتاح من URL
      const key = url.split(`/${config.S3_BUCKET}/`)[1];
      
      if (!key) {
        throw new Error('Invalid image URL');
      }
      
      // حذف من S3
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
   * رفع صورة بحجم مخصص (للأفاتار مثلاً)
   */
  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    try {
      // تحسين بحجم صغير للأفاتار
      const optimized = await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      const filename = `${uuidv4()}.jpg`;
      const key = `avatars/${filename}`;
      
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: config.S3_BUCKET,
          Key: key,
          Body: optimized,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        }
      });
      
      await upload.done();
      
      const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/${key}`;
      
      logger.info(`✅ Avatar uploaded: ${url}`);
      return url;
      
    } catch (error) {
      logger.error('❌ Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    }
  }
}
