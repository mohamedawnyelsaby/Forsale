"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const review_validator_1 = require("../validators/review.validator");
const router = (0, express_1.Router)();
const reviewController = new review_controller_1.ReviewController();
router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', auth_1.authenticate, (0, validate_1.validate)(review_validator_1.createReviewSchema), reviewController.create);
router.delete('/:id', auth_1.authenticate, reviewController.delete);
exports.default = router;
//# sourceMappingURL=review.routes.js.map