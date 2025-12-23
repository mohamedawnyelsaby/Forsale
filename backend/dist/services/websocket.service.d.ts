import { Server } from 'http';
export declare class WebSocketService {
    private io;
    private userSockets;
    constructor(server: Server);
    private setupMiddleware;
    private setupHandlers;
    private handleSendMessage;
    private sendNotification;
    notifyUser(userId: number, notification: any): Promise<void>;
    notifyOrderUpdate(orderId: number, update: any): Promise<void>;
}
//# sourceMappingURL=websocket.service.d.ts.map