import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class PiController {
    createPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    approvePayment(req: Request, res: Response, next: NextFunction): Promise<void>;
    completePayment(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    cancelPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    paymentCallback(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=pi.controller.d.ts.map