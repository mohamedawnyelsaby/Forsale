/**
 * PI NETWORK AUTHENTICATION ENDPOINT
 * Handles user authentication and session management
 * apps/web/src/app/api/auth/pi/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyPiAccessToken } from '@/lib/pi-network';
import { prisma } from '@forsale/database';

// ============================================
// TYPES
// ============================================

interface AuthRequest {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

// ============================================
// LOGGER
// ============================================

const logger = {
  info: (msg: string, data?: any) => console.log(`[AUTH] ${msg}`, data || ''),
  error: (msg: string, error: any, data?: any) => console.error(`[AUTH ERROR] ${msg}`, error, data || ''),
};

// ============================================
// VALIDATION
// ============================================

function validateAuthRequest(body: any): body is AuthRequest {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.accessToken === 'string' &&
    body.accessToken.length > 0 &&
    body.user &&
    typeof body.user.uid === 'string' &&
    typeof body.user.username === 'string'
  );
}

// ============================================
// POST: Authenticate User
// ============================================

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json();

    if (!validateAuthRequest(body)) {
      logger.error('Invalid request body', body);
      return NextResponse.json(
        { error: 'Invalid request - accessToken and user required' },
        { status: 400 }
      );
    }

    const { accessToken, user } = body;

    logger.info('Authentication attempt', { userId: user.uid });

    // 2. Verify token with Pi Network
    const verifiedUser = await verifyPiAccessToken(accessToken);

    if (!verifiedUser || verifiedUser.uid !== user.uid) {
      logger.error('Token verification failed', null, { 
        providedUid: user.uid,
        verifiedUid: verifiedUser?.uid 
      });
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // 3. Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { piUserId: user.uid },
      select: {
        id: true,
        piUserId: true,
        piUsername: true,
        email: true,
        role: true,
        verificationLevel: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          piUserId: user.uid,
          piUsername: user.username,
          email: `${user.uid}@pi.network`, // Placeholder
          role: 'BUYER',
          verificationLevel: 'PI_KYC_VERIFIED',
        },
        select: {
          id: true,
          piUserId: true,
          piUsername: true,
          email: true,
          role: true,
          verificationLevel: true,
          createdAt: true,
        },
      });

      logger.info('New user created', { userId: dbUser.id });
    } else {
      // Update username if changed
      if (dbUser.piUsername !== user.username) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { piUsername: user.username },
          select: {
            id: true,
            piUserId: true,
            piUsername: true,
            email: true,
            role: true,
            verificationLevel: true,
            createdAt: true,
          },
        });
      }

      logger.info('Existing user authenticated', { userId: dbUser.id });
    }

    // 4. Return user data
    return NextResponse.json({
      success: true,
      user: dbUser,
      message: 'Authentication successful',
    });

  } catch (error) {
    logger.error('Authentication error', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// GET: Get Current User
// ============================================

export async function GET(req: NextRequest) {
  try {
    // Get access token from header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Verify token
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { piUserId: user.uid },
      select: {
        id: true,
        piUserId: true,
        piUsername: true,
        email: true,
        role: true,
        verificationLevel: true,
        firstName: true,
        lastName: true,
        avatar: true,
        trustScore: true,
        totalOrders: true,
        totalSales: true,
        averageRating: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: dbUser,
    });

  } catch (error) {
    logger.error('Get user error', error as Error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
