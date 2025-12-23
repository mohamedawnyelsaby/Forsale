"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
        description: zod_1.z.string().optional(),
        price_pi: zod_1.z.number().positive('Price must be positive'),
        category: zod_1.z.string().min(1, 'Category is required'),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        stock: zod_1.z.number().int().min(0).optional()
    })
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().optional(),
        price_pi: zod_1.z.number().positive().optional(),
        category: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string().url()).optional(),
        stock: zod_1.z.number().int().min(0).optional()
    })
});
//# sourceMappingURL=product.validator.js.map