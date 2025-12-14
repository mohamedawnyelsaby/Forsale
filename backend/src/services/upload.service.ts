// ============================================
// 📄 FILENAME: upload.service.ts
// 📍 PATH: backend/src/services/upload.service.ts
// ============================================

import AWS from 'aws-sdk';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class UploadService {
  private s3: AWS.S3;
  
  constructor() {
    this.s3 = new AWS.S3({
      endpoint: config.S3_ENDPOINT,
      accessKeyId: config.S3_KEY,
      secretAccessKey: config.S3_SECRET,
      s3ForcePathStyle: true
    });
  }
  
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // Optimize image
      const optimized = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Generate unique filename
      const filename = `${uuidv4()}.jpg`;
      
      // Upload to S3/Spaces
      await this.s3.putObject({
        Bucket: config.S3_BUCKET,
        Key: `products/${filename}`,
        Body: optimized,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      }).promise();
      
      const url = `${config.S3_ENDPOINT}/${config.S3_BUCKET}/products/${filename}`;
      
      logger.info(`Image uploaded: ${url}`);
      return url;
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw error;
    }
  }
  
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file));
    return Promise.all(uploadPromises);
  }
  
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract key from URL
      const key = url.split(`/${config.S3_BUCKET}/`)[1];
      
      await this.s3.deleteObject({
        Bucket: config.S3_BUCKET,
        Key: key
      }).promise();
      
      logger.info(`Image deleted: ${url}`);
    } catch (error) {
      logger.error('Image deletion failed:', error);
      throw error;
    }
  }
}
