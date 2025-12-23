"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class UploadService {
    s3Client;
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            endpoint: env_1.config.S3_ENDPOINT,
            region: 'auto',
            credentials: {
                accessKeyId: env_1.config.S3_KEY,
                secretAccessKey: env_1.config.S3_SECRET
            },
            forcePathStyle: true
        });
        logger_1.logger.info('✅ Upload Service initialized');
    }
    async uploadImage(file) {
        try {
            const ext = file.mimetype.split('/')[1] || 'jpg';
            const filename = `${(0, uuid_1.v4)()}.${ext}`;
            const key = `products/${filename}`;
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: {
                    Bucket: env_1.config.S3_BUCKET,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read',
                    CacheControl: 'max-age=31536000',
                }
            });
            await upload.done();
            const url = `${env_1.config.S3_ENDPOINT}/${env_1.config.S3_BUCKET}/${key}`;
            logger_1.logger.info(`✅ Image uploaded: ${url}`);
            return url;
        }
        catch (error) {
            logger_1.logger.error('❌ Image upload failed:', error);
            throw new Error('Failed to upload image');
        }
    }
    async uploadMultipleImages(files) {
        try {
            const uploadPromises = files.map(file => this.uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            logger_1.logger.info(`✅ Uploaded ${urls.length} images`);
            return urls;
        }
        catch (error) {
            logger_1.logger.error('❌ Multiple upload failed:', error);
            throw new Error('Failed to upload images');
        }
    }
    async deleteImage(url) {
        try {
            const urlParts = url.split(`/${env_1.config.S3_BUCKET}/`);
            if (urlParts.length < 2) {
                throw new Error('Invalid image URL');
            }
            const key = urlParts[1].split('?')[0];
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: env_1.config.S3_BUCKET,
                Key: key
            });
            await this.s3Client.send(command);
            logger_1.logger.info(`✅ Image deleted: ${url}`);
        }
        catch (error) {
            logger_1.logger.error('❌ Image deletion failed:', error);
            throw new Error('Failed to delete image');
        }
    }
    async uploadAvatar(file) {
        try {
            const ext = file.mimetype.split('/')[1] || 'jpg';
            const filename = `${(0, uuid_1.v4)()}.${ext}`;
            const key = `avatars/${filename}`;
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: {
                    Bucket: env_1.config.S3_BUCKET,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read',
                    CacheControl: 'max-age=31536000',
                }
            });
            await upload.done();
            const url = `${env_1.config.S3_ENDPOINT}/${env_1.config.S3_BUCKET}/${key}`;
            logger_1.logger.info(`✅ Avatar uploaded: ${url}`);
            return url;
        }
        catch (error) {
            logger_1.logger.error('❌ Avatar upload failed:', error);
            throw new Error('Failed to upload avatar');
        }
    }
    validateFile(file) {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/jpg'
        ];
        const maxSize = 10 * 1024 * 1024;
        if (!allowedMimes.includes(file.mimetype)) {
            throw new Error('Invalid file type');
        }
        if (file.size > maxSize) {
            throw new Error('File too large');
        }
        return true;
    }
    getThumbnailUrl(originalUrl) {
        return originalUrl;
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map