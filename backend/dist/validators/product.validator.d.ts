import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        price_pi: z.ZodNumber;
        category: z.ZodString;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        stock: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        price_pi: number;
        category: string;
        description?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    }, {
        title: string;
        price_pi: number;
        category: string;
        description?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        price_pi: number;
        category: string;
        description?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    };
}, {
    body: {
        title: string;
        price_pi: number;
        category: string;
        description?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    };
}>;
export declare const updateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price_pi: z.ZodOptional<z.ZodNumber>;
        category: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        stock: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        price_pi?: number | undefined;
        category?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        price_pi?: number | undefined;
        category?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        description?: string | undefined;
        price_pi?: number | undefined;
        category?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    };
}, {
    body: {
        title?: string | undefined;
        description?: string | undefined;
        price_pi?: number | undefined;
        category?: string | undefined;
        images?: string[] | undefined;
        stock?: number | undefined;
    };
}>;
//# sourceMappingURL=product.validator.d.ts.map