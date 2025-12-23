import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class MessageController {
    getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getConversationWith(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=message.controller.d.ts.map