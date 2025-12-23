import { z } from 'zod';
export declare const createReviewSchema: z.ZodObject<{
    body: z.ZodObject<{
        product_id: z.ZodNumber;
        rating: z.ZodNumber;
        comment: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        product_id: number;
        rating: number;
        comment?: string | undefined;
    }, {
        product_id: number;
        rating: number;
        comment?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        product_id: number;
        rating: number;
        comment?: string | undefined;
    };
}, {
    body: {
        product_id: number;
        rating: number;
        comment?: string | undefined;
    };
}>;
//# sourceMappingURL=review.validator.d.ts.map