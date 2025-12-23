import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class OrderController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getMyOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    confirmDelivery(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createDispute(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=order.controller.d.ts.map