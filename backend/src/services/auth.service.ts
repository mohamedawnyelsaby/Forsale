// ============================================
// 📄 FILENAME: auth.service.ts
// 📍 PATH: backend/src/services/auth.service.ts
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
  }) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user
    const user = await prisma.user.create({
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
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Send verification email
    const verificationToken = jwt.sign(
      { userId: user.id },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `<a href="${config.PI_CALLBACK_BASE}/verify?token=${verificationToken}">Verify Email</a>`
    });
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
  
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }
    
    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }
  
  async refreshToken(token: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
      
      // Check if token exists in DB
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token,
          user_id: decoded.id,
          revoked: false
        }
      });
      
      if (!storedToken) {
        throw new AppError('Invalid refresh token', 401);
      }
      
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Generate new tokens
      const accessToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);
      
      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true }
      });
      
      // Save new refresh token
      await prisma.refreshToken.create({
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
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
  
  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true }
    });
  }
  
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return;
    }
    
    const resetToken = jwt.sign(
      { userId: user.id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `<a href="${config.PI_CALLBACK_BASE}/reset-password?token=${resetToken}">Reset Password</a>`
    });
  }
  
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password_hash: hashedPassword }
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 400);
    }
  }
  
  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { email_verified: true }
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 400);
    }
  }
}
