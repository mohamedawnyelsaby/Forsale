"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const auth_validator_1 = require("../validators/auth.validator");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
router.post('/register', (0, validate_1.validate)(auth_validator_1.registerSchema), authController.register);
router.post('/login', (0, validate_1.validate)(auth_validator_1.loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map