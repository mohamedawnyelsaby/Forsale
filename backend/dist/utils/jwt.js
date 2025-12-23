"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role
    }, env_1.config.JWT_SECRET, { expiresIn: env_1.config.JWT_EXPIRE });
};
exports.generateToken = generateToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email
    }, env_1.config.JWT_REFRESH_SECRET, { expiresIn: env_1.config.JWT_REFRESH_EXPIRE });
};
exports.generateRefreshToken = generateRefreshToken;
//# sourceMappingURL=jwt.js.map