"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        product_id: zod_1.z.number().positive(),
        rating: zod_1.z.number().min(1).max(5),
        comment: zod_1.z.string().optional()
    })
});
//# sourceMappingURL=review.validator.js.map