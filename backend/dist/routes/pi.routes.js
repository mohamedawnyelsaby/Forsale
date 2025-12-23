"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pi_controller_1 = require("../controllers/pi.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const piController = new pi_controller_1.PiController();
router.post('/create-payment', auth_1.authenticate, (req, res, next) => {
    piController.createPayment(req, res, next);
});
router.post('/approve-payment', (req, res, next) => {
    piController.approvePayment(req, res, next);
});
router.post('/complete-payment', (req, res, next) => {
    piController.completePayment(req, res, next);
});
router.post('/cancel-payment', auth_1.authenticate, (req, res, next) => {
    piController.cancelPayment(req, res, next);
});
router.post('/payment-callback', (req, res, next) => {
    piController.paymentCallback(req, res, next);
});
exports.default = router;
//# sourceMappingURL=pi.routes.js.map