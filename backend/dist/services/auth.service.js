"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
class AuthService {
    async register(data) {
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new AppError_1.AppError('Email already registered', 400);
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email,
                password_hash: hashedPassword,
                name: data.name,
                role: 'user'
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true
            }
        });
        const accessToken = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        await database_1.prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        const verificationToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.JWT_SECRET, { expiresIn: '24h' });
        await (0, email_1.sendEmail)({
            to: user.email,
            subject: 'Verify your email',
            html: `<a href="${env_1.config.PI_CALLBACK_BASE}/verify?token=${verificationToken}">Verify Email</a>`
        });
        return {
            user,
            accessToken,
            refreshToken
        };
    }
    async login(email, password) {
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        const accessToken = (0, jwt_1.generateToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        await database_1.prisma.refreshToken.create({
            data: {
                user_id: user.id,
                token: refreshToken,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        const { password_hash, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken
        };
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_REFRESH_SECRET);
            const storedToken = await database_1.prisma.refreshToken.findFirst({
                where: {
                    token,
                    user_id: decoded.id,
                    revoked: false
                }
            });
            if (!storedToken) {
                throw new AppError_1.AppError('Invalid refresh token', 401);
            }
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.id }
            });
            if (!user) {
                throw new AppError_1.AppError('User not found', 404);
            }
            const accessToken = (0, jwt_1.generateToken)(user);
            const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
            await database_1.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revoked: true }
            });
            await database_1.prisma.refreshToken.create({
                data: {
                    user_id: user.id,
                    token: newRefreshToken,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            throw new AppError_1.AppError('Invalid refresh token', 401);
        }
    }
    async logout(token) {
        await database_1.prisma.refreshToken.updateMany({
            where: { token },
            data: { revoked: true }
        });
    }
    async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return;
        }
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.JWT_SECRET, { expiresIn: '1h' });
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Password Reset',
            html: `<a href="${env_1.config.PI_CALLBACK_BASE}/reset-password?token=${resetToken}">Reset Password</a>`
        });
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            await database_1.prisma.user.update({
                where: { id: decoded.userId },
                data: { password_hash: hashedPassword }
            });
        }
        catch (error) {
            throw new AppError_1.AppError('Invalid or expired token', 400);
        }
    }
    async verifyEmail(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_SECRET);
            await database_1.prisma.user.update({
                where: { id: decoded.userId },
                data: { email_verified: true }
            });
        }
        catch (error) {
            throw new AppError_1.AppError('Invalid or expired token', 400);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map