export declare class AIService {
    analyzeProduct(data: {
        description?: string;
        images?: string[];
    }): Promise<any>;
    getPriceRecommendation(productData: any): Promise<any>;
    detectFraud(orderData: any): Promise<any>;
    analyzeDispute(data: any): Promise<any>;
}
//# sourceMappingURL=ai.service.d.ts.map