import { Request, Response, NextFunction } from 'express';
export declare class UploadController {
    uploadImage(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadMultipleImages(req: Request, res: Response, next: NextFunction): Promise<void>;
    uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteImage(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=upload.controller.d.ts.map