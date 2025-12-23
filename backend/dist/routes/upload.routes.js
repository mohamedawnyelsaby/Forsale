"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controller_1 = require("../controllers/upload.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const uploadController = new upload_controller_1.UploadController();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
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
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
router.post('/image', auth_1.authenticate, upload.single('image'), (req, res, next) => {
    uploadController.uploadImage(req, res, next);
});
router.post('/images', auth_1.authenticate, upload.array('images', 10), (req, res, next) => {
    uploadController.uploadMultipleImages(req, res, next);
});
router.post('/avatar', auth_1.authenticate, upload.single('avatar'), (req, res, next) => {
    uploadController.uploadAvatar(req, res, next);
});
router.delete('/image', auth_1.authenticate, (req, res, next) => {
    uploadController.deleteImage(req, res, next);
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map