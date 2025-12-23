export declare class ReviewService {
    getProductReviews(productId: number): Promise<{
        reviews: {
            id: number;
            created_at: Date;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            product_id: number;
            reviewer_id: number;
            reviewee_id: number;
            rating: number;
            comment: string | null;
            helpful_count: number;
            verified_purchase: boolean;
            ai_sentiment: string | null;
        }[];
        stats: {
            total: number;
            average: number;
        };
    }>;
    create(data: {
        user_id: number;
        product_id: number;
        rating: number;
        comment?: string;
    }): Promise<{
        id: number;
        created_at: Date;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        product_id: number;
        reviewer_id: number;
        reviewee_id: number;
        rating: number;
        comment: string | null;
        helpful_count: number;
        verified_purchase: boolean;
        ai_sentiment: string | null;
    }>;
    delete(id: number, userId: number): Promise<void>;
}
//# sourceMappingURL=review.service.d.ts.map