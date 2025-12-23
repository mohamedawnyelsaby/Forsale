export declare class ReviewService {
    getProductReviews(productId: number): Promise<any>;
    create(data: {
        user_id: number;
        product_id: number;
        rating: number;
        comment?: string;
    }): Promise<any>;
    delete(id: number, userId: number): Promise<void>;
}
//# sourceMappingURL=review.service.d.ts.map