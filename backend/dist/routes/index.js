"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const pi_routes_1 = __importDefault(require("./pi.routes"));
const upload_routes_1 = __importDefault(require("./upload.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const message_routes_1 = __importDefault(require("./message.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/pi', pi_routes_1.default);
router.use('/upload', upload_routes_1.default);
router.use('/reviews', review_routes_1.default);
router.use('/messages', message_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map