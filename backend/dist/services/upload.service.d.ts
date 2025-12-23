export declare class UploadService {
    private s3Client;
    constructor();
    uploadImage(file: Express.Multer.File): Promise<string>;
    uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]>;
    deleteImage(url: string): Promise<void>;
    uploadAvatar(file: Express.Multer.File): Promise<string>;
    validateFile(file: Express.Multer.File): boolean;
    getThumbnailUrl(originalUrl: string): string;
}
//# sourceMappingURL=upload.service.d.ts.map