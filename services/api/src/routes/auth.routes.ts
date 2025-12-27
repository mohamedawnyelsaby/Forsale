// ============================================
// FORSALE AUTHENTICATION ROUTES
// Pi Network OAuth + JWT Authentication
// ============================================
// PATH: services/api/src/routes/auth.routes.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@forsale/database';
import { piNetworkClient } from '@forsale/payments';
import jwt from 'jsonwebtoken';

// ============================================
// TYPES
// ============================================

interface PiAuthBody {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface RefreshTokenBody {
  refreshToken: string;
}

// ============================================
// JWT UTILITIES
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'access') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'refresh') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// ============================================
// AUTH MIDDLEWARE
// ============================================

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return reply.status(401).send({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach user to request
    (request as any).user = { userId: decoded.userId };
  } catch (error) {
    return reply.status(401).send({
      success: false,
      error: 'Authentication failed',
    });
  }
}

// ============================================
// ROUTES
// ============================================

export async function authRoutes(server: FastifyInstance) {
  
  // ============================================
  // POST /api/auth/pi-login
  // Authenticate with Pi Network
  // ============================================
  server.post<{ Body: PiAuthBody }>(
    '/api/auth/pi-login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['accessToken', 'user'],
          properties: {
            accessToken: { type: 'string' },
            user: {
              type: 'object',
              required: ['uid', 'username'],
              properties: {
                uid: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { accessToken, user: piUser } = request.body;

        // Verify with Pi Network
        const verifiedUser = await piNetworkClient.authenticateUser(accessToken);

        if (verifiedUser.uid !== piUser.uid) {
          return reply.status(401).send({
            success: false,
            error: 'Pi Network authentication failed',
          });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { piUserId: piUser.uid },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              piUserId: piUser.uid,
              piUsername: piUser.username,
              email: `${piUser.username}@pi.temp`, // Temporary email
              role: 'BUYER',
              verificationLevel: 'UNVERIFIED',
            },
          });
        }

        // Generate tokens
        const accessToken_jwt = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        return reply.send({
          success: true,
          data: {
            user: {
              id: user.id,
              piUserId: user.piUserId,
              piUsername: user.piUsername,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
              verificationLevel: user.verificationLevel,
              kycVerified: user.kycVerified,
            },
            tokens: {
              accessToken: accessToken_jwt,
              refreshToken,
              expiresIn: ACCESS_TOKEN_EXPIRY,
            },
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Login failed',
        });
      }
    }
  );

  // ============================================
  // POST /api/auth/refresh
  // Refresh access token
  // ============================================
  server.post<{ Body: RefreshTokenBody }>(
    '/api/auth/refresh',
    {
      schema: {
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { refreshToken } = request.body;

        const decoded = verifyRefreshToken(refreshToken);

        if (!decoded) {
          return reply.status(401).send({
            success: false,
            error: 'Invalid or expired refresh token',
          });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(decoded.userId);

        return reply.send({
          success: true,
          data: {
            accessToken: newAccessToken,
            expiresIn: ACCESS_TOKEN_EXPIRY,
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Token refresh failed',
        });
      }
    }
  );

  // ============================================
  // GET /api/auth/me
  // Get current user
  // ============================================
  server.get(
    '/api/auth/me',
    {
      preHandler: authenticateUser,
    },
    async (request, reply) => {
      try {
        const userId = (request as any).user.userId;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            piUserId: true,
            piUsername: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
            role: true,
            verificationLevel: true,
            kycVerified: true,
            trustScore: true,
            totalOrders: true,
            totalSales: true,
            averageRating: true,
            createdAt: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: 'User not found',
          });
        }

        return reply.send({
          success: true,
          data: user,
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch user',
        });
      }
    }
  );

  // ============================================
  // PUT /api/auth/profile
  // Update user profile
  // ============================================
  server.put<{
    Body: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      phone?: string;
      country?: string;
      city?: string;
    };
  }>(
    '/api/auth/profile',
    {
      preHandler: authenticateUser,
      schema: {
        body: {
          type: 'object',
          properties: {
            firstName: { type: 'string', maxLength: 50 },
            lastName: { type: 'string', maxLength: 50 },
            bio: { type: 'string', maxLength: 500 },
            phone: { type: 'string', maxLength: 20 },
            country: { type: 'string', maxLength: 2 },
            city: { type: 'string', maxLength: 100 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const updates = request.body;

        const user = await prisma.user.update({
          where: { id: userId },
          data: updates,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            phone: true,
            country: true,
            city: true,
          },
        });

        return reply.send({
          success: true,
          data: user,
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to update profile',
        });
      }
    }
  );

  // ============================================
  // POST /api/auth/verify-email
  // Verify email (simplified - production needs email service)
  // ============================================
  server.post<{ Body: { email: string } }>(
    '/api/auth/verify-email',
    {
      preHandler: authenticateUser,
      schema: {
        body: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const { email } = request.body;

        // In production: send verification email
        // For now: auto-verify

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            email,
            emailVerified: new Date(),
            verificationLevel: 'EMAIL_VERIFIED',
          },
        });

        return reply.send({
          success: true,
          message: 'Email verified successfully',
          data: {
            verificationLevel: user.verificationLevel,
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Email verification failed',
        });
      }
    }
  );

  // ============================================
  // POST /api/auth/verify-phone
  // Verify phone (simplified)
  // ============================================
  server.post<{ Body: { phone: string } }>(
    '/api/auth/verify-phone',
    {
      preHandler: authenticateUser,
      schema: {
        body: {
          type: 'object',
          required: ['phone'],
          properties: {
            phone: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = (request as any).user.userId;
        const { phone } = request.body;

        // In production: send SMS verification
        // For now: auto-verify

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            phone,
            phoneVerified: new Date(),
            verificationLevel: 'PHONE_VERIFIED',
          },
        });

        return reply.send({
          success: true,
          message: 'Phone verified successfully',
          data: {
            verificationLevel: user.verificationLevel,
          },
        });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({
          success: false,
          error: 'Phone verification failed',
        });
      }
    }
  );

  // ============================================
  // POST /api/auth/logout
  // Logout (client-side token removal mostly)
  // ============================================
  server.post(
    '/api/auth/logout',
    {
      preHandler: authenticateUser,
    },
    async (request, reply) => {
      // In production with Redis: blacklist the token
      // For now: just return success
      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    }
  );
}

// Export middleware for use in other routes
export { authenticateUser as authMiddleware };
