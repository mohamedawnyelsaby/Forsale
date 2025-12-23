interface PaymentMetadata {
    productId: string;
    userId: string;
    expectedAmount: number;
    timestamp: number;
    [key: string]: any;
}
interface CreatePaymentData {
    amount: number;
    memo: string;
    metadata: PaymentMetadata;
}
interface PiPaymentResponse {
    identifier: string;
    status: string;
    amount: number;
    transaction?: {
        txid: string;
        verified: boolean;
    };
    metadata?: any;
    from_address?: string;
    to_address?: string;
    created_at?: string;
}
interface WebhookPayload {
    paymentId: string;
    txid: string;
    signature: string;
}
export declare class PiService {
    private apiKey;
    private appSecret;
    private axiosInstance;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY;
    constructor();
    private handleAxiosError;
    private retryRequest;
    private isRetryableError;
    private delay;
    createPayment(data: CreatePaymentData): Promise<PiPaymentResponse>;
    approvePayment(paymentId: string): Promise<PiPaymentResponse>;
    completePayment(paymentId: string, txid: string): Promise<PiPaymentResponse>;
    cancelPayment(paymentId: string): Promise<PiPaymentResponse>;
    private paymentCache;
    private readonly CACHE_TTL;
    getPayment(paymentId: string): Promise<PiPaymentResponse>;
    private clearOldCache;
    verifyPaymentCallback(paymentId: string, txid: string, signature: string): boolean;
    handleWebhook(payload: WebhookPayload): Promise<boolean>;
    verifyUserToken(accessToken: string): Promise<any>;
    healthCheck(): Promise<boolean>;
    destroy(): void;
}
export {};
//# sourceMappingURL=pi.service.d.ts.map