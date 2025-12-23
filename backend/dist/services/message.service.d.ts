export declare class MessageService {
    getUserConversations(userId: number): Promise<unknown>;
    getConversation(userId: number, otherUserId: number): Promise<({
        sender: {
            id: number;
            name: string | null;
        };
    } & {
        id: number;
        created_at: Date;
        conversation_id: string;
        sender_id: number;
        receiver_id: number;
        content: string;
        message_type: string;
        read: boolean;
    })[]>;
    sendMessage(data: {
        sender_id: number;
        receiver_id: number;
        content: string;
    }): Promise<{
        id: number;
        created_at: Date;
        conversation_id: string;
        sender_id: number;
        receiver_id: number;
        content: string;
        message_type: string;
        read: boolean;
    }>;
    markAsRead(messageId: number, userId: number): Promise<void>;
}
//# sourceMappingURL=message.service.d.ts.map