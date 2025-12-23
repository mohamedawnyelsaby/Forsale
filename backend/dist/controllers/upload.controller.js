"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const upload_service_1 = require("../services/upload.service");
const AppError_1 = require("../utils/AppError");
const uploadService = new upload_service_1.UploadService();
class UploadController {
    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError_1.AppError('No file provided', 400);
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
        }
        catch (error) {
            next(error);
        }
    }
    async uploadMultipleImages(req, res, next) {
        try {
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw new AppError_1.AppError('No files provided', 400);
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
        }
        catch (error) {
            next(error);
        }
    }
    async uploadAvatar(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError_1.AppError('No file provided', 400);
            }
            uploadService.validateFile(req.file);
            const url = await uploadService.uploadAvatar(req.file);
            res.json({
                success: true,
                data: { url }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteImage(req, res, next) {
        try {
            const { url } = req.body;
            if (!url) {
                throw new AppError_1.AppError('Image URL is required', 400);
            }
            await uploadService.deleteImage(url);
            res.json({
                success: true,
                message: 'Image deleted successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UploadController = UploadController;
//# sourceMappingURL=upload.controller.js.map