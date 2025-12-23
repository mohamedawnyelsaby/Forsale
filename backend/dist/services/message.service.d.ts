export declare class MessageService {
    getUserConversations(userId: number): Promise<any[]>;
    getConversation(userId: number, otherUserId: number): Promise<any[]>;
    sendMessage(data: {
        sender_id: number;
        receiver_id: number;
        content: string;
    }): Promise<any>;
    markAsRead(messageId: number, userId: number): Promise<void>;
}
//# sourceMappingURL=message.service.d.ts.map