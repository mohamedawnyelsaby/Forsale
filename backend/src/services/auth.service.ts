// ============================================
// 📄 FILENAME: auth.service.ts
// 📍 PATH: backend/src/services/auth.service.ts
// 🌍 GLOBAL EDITION - Multi-regional authentication system
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * @class AuthService
 * @description Global authentication service with Pi Network integration and multi-region support
 * @version 2.2.0
 */
export class AuthService {
  /**
   * Registers a new user with email verification
   * @param data - User registration data
   * @param region - User's geographic region
   * @param language - User's preferred language
   * @returns User object with authentication tokens
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }, region: string = 'global', language: string = 'en') {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
    
    // Validate region and language
    const validRegions = ['global', 'middle-east', 'asia', 'europe', 'africa', 'americas'];
    const validLanguages = ['en', 'ar', 'zh', 'hi', 'es', 'fr', 'ru'];
    
    if (!validRegions.includes(region)) region = 'global';
    if (!validLanguages.includes(language)) language = 'en';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Create user with global attributes
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        name: data.name,
        role: 'user',
        region: region,
        language: language,
        trust_score: 90, // Default trust score for new users
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        region: true,
        language: true,
        trust_score: true,
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
    
    // Send verification email with region-specific content
    const verificationToken = jwt.sign(
      { userId: user.id },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await this.sendLocalizedVerificationEmail(user, verificationToken);
    
    logger.info(`New user registered: ${user.id} from region: ${region}`);
    return {
      user,
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Logs in a user with email and password
   * @param email - User email
   * @param password - User password
   * @returns User object with authentication tokens
   */
  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      logger.warn(`Login attempt for non-existent email: ${email}`);
      throw new AppError('Invalid credentials', 401);
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      logger.warn(`Failed login attempt for user: ${user.id}`);
      throw new AppError('Invalid credentials', 401);
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        last_login: new Date(),
        login_count: { increment: 1 }
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
    
    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;
    
    logger.info(`Successful login for user: ${user.id} from region: ${user.region}`);
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Authenticates user with Pi Network credentials
   * @param piData - Pi Network authentication data
   * @returns User object with Pi-specific sessions
   */
  async loginWithPi(piData: {
    username: string;
    accessToken: string;
    scopes: string[];
    region?: string;
    language?: string;
  }) {
    try {
      // Validate Pi Network credentials
      const isValidPiUser = await this.validatePiCredentials(piData);
      
      if (!isValidPiUser) {
        logger.error('Invalid Pi Network credentials provided');
        throw new AppError('Invalid Pi Network credentials', 401);
      }
      
      // Find or create user based on Pi username
      let user = await prisma.user.findUnique({
        where: { pi_username: piData.username }
      });
      
      if (!user) {
        // Create new user with Pi Network details
        const region = piData.region || 'global';
        const language = piData.language || 'en';
        
        user = await prisma.user.create({
          data: {
            pi_username: piData.username,
            email: `${piData.username.replace(/\s+/g, '_')}@pimail.com`,
            name: piData.username,
            role: 'user',
            pi_access_token: piData.accessToken,
            is_pi_verified: true,
            region: region,
            language: language,
            trust_score: 95, // Higher trust score for Pi verified users
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      } else {
        // Update existing user with new Pi token
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            pi_access_token: piData.accessToken,
            is_pi_verified: true,
            last_login: new Date(),
            login_count: { increment: 1 }
          }
        });
      }
      
      // Generate multi-session tokens for global experience
      return this.generateGlobalSessions(user);
    } catch (error) {
      logger.error('Pi Network login failed:', error);
      throw new AppError('Pi Network authentication failed', 503);
    }
  }
  
  /**
   * Validates Pi Network credentials
   * @param piData - Pi authentication data
   * @returns Boolean indicating validity
   */
  private async validatePiCredentials(piData: {
    username: string;
    accessToken: string;
    scopes: string[];
  }): Promise<boolean> {
    // This would be replaced with actual Pi Network API validation
    // For now, we validate basic structure
    if (!piData.username || !piData.accessToken) {
      return false;
    }
    
    // Basic scope validation
    const requiredScopes = ['payments', 'username'];
    return requiredScopes.every(scope => piData.scopes.includes(scope));
  }
  
  /**
   * Refreshes authentication token
   * @param token - Refresh token
   * @returns New access and refresh tokens
   */
  async refreshToken(token: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
      
      // Check if token exists in DB and is not revoked
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token,
          user_id: decoded.id,
          revoked: false
        }
      });
      
      if (!storedToken) {
        logger.warn(`Invalid or revoked refresh token used: ${token.substring(0, 10)}...`);
        throw new AppError('Invalid refresh token', 401);
      }
      
      // Check if token is expired
      if (storedToken.expires_at < new Date()) {
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revoked: true }
        });
        logger.warn(`Expired refresh token used: ${token.substring(0, 10)}...`);
        throw new AppError('Refresh token expired', 401);
      }
      
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      if (!user) {
        logger.error(`User not found for refresh token: ${decoded.id}`);
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
      
      logger.info(`Token refreshed for user: ${user.id}`);
      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }
  
  /**
   * Logs out user by revoking refresh token
   * @param token - Refresh token to revoke
   */
  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true }
    });
    
    logger.info(`User logged out with token: ${token.substring(0, 10)}...`);
  }
  
  /**
   * Sends password reset email
   * @param email - User email
   */
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists for security reasons
      return;
    }
    
    const resetToken = jwt.sign(
      { userId: user.id },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${config.FRONTEND_URL}/reset-password?token=${resetToken}" 
                style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
             </a>
             <p>This link will expire in 1 hour.</p>`
    });
    
    logger.info(`Password reset email sent to: ${email}`);
  }
  
  /**
   * Resets user password
   * @param token - Reset token
   * @param newPassword - New password
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });
      
      logger.info(`Password reset successful for user: ${decoded.userId}`);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw new AppError('Invalid or expired token', 400);
    }
  }
  
  /**
   * Verifies user email
   * @param token - Verification token
   */
  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          email_verified: true,
          is_verified: true,
          updated_at: new Date()
        }
      });
      
      logger.info(`Email verified for user: ${decoded.userId}`);
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw new AppError('Invalid or expired token', 400);
    }
  }
  
  /**
   * Generates multiple session tokens for global experience
   * @param user - User object
   * @returns Object containing multiple session tokens
   */
  private generateGlobalSessions(user: any) {
    const sessionId = crypto.randomUUID();
    const now = new Date();
    
    // Main application token
    const mainSession = generateToken(user);
    
    // Global trading session (30 days)
    const globalSession = jwt.sign(
      { 
        userId: user.id,
        sessionId,
        permissions: ['global_trade', 'multi_currency', 'premium_support'],
        region: user.region
      },
      config.JWT_GLOBAL_SECRET,
      { expiresIn: '30d' }
    );
    
    // AI features session (7 days)
    const aiSession = jwt.sign(
      { 
        userId: user.id,
        sessionId,
        ai_level: 'premium',
        features: ['price_prediction', 'image_analysis', 'dispute_resolution']
      },
      config.JWT_AI_SECRET,
      { expiresIn: '7d' }
    );
    
    // Trust verification token (90 days)
    const trustSession = jwt.sign(
      {
        userId: user.id,
        trustScore: user.trust_score,
        verificationLevel: user.trust_score > 95 ? 'verified' : 'standard',
        sessionId
      },
      config.JWT_TRUST_SECRET,
      { expiresIn: '90d' }
    );
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        pi_username: user.pi_username,
        region: user.region,
        language: user.language,
        trust_score: user.trust_score || 95,
        is_verified: user.is_verified || false,
        is_pi_verified: user.is_pi_verified || false,
        member_since: user.created_at.toISOString()
      },
      sessions: {
        main: mainSession,
        global: globalSession,
        ai: aiSession,
        trust: trustSession
      },
      features: {
        ai_analyst: user.trust_score > 85,
        global_shipping: true,
        price_protection: user.trust_score > 90,
        trust_verification: true,
        multi_currency: true
      },
      session_expiry: {
        main: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        global: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ai: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }
  
  /**
   * Sends localized verification email based on user region and language
   * @param user - User object
   * @param token - Verification token
   */
  private async sendLocalizedVerificationEmail(user: any, token: string) {
    const verificationLink = `${config.FRONTEND_URL}/verify?token=${token}`;
    
    const emailContent = this.getEmailTemplateByLanguage(user.language, verificationLink);
    
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html
    });
  }
  
  /**
   * Gets email template based on user language
   * @param language - User language code
   * @param verificationLink - Verification URL
   * @returns Email content in appropriate language
   */
  private getEmailTemplateByLanguage(language: string, verificationLink: string) {
    const templates: Record<string, { subject: string; html: string }> = {
      en: {
        subject: 'Verify your Forsale AI account',
        html: `<p>Hello,</p>
               <p>Please verify your email address to activate your Forsale AI account:</p>
               <a href="${verificationLink}" 
                  style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                  Verify Email
               </a>
               <p>If you didn't create this account, please ignore this email.</p>
               <p>Best regards,<br>Forsale AI Team</p>`
      },
      ar: {
        subject: 'تحقق من حسابك في Forsale AI',
        html: `<p>مرحباً،</p>
               <p>يرجى التحقق من عنوان بريدك الإلكتروني لتفعيل حسابك في Forsale AI:</p>
               <a href="${verificationLink}" 
                  style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; text-align: center;">
                  تحقق من البريد الإلكتروني
               </a>
               <p>إذا لم تقم بإنشاء هذا الحساب، فيرجى تجاهل هذه الرسالة.</p>
               <p>مع أطيب التحيات،<br>فريق Forsale AI</p>`
      }
    };
    
    return templates[language] || templates['en'];
  }
}
