/**
 * CURRENT USER API ENDPOINT
 * Get and update current user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@forsale/database';
import { verifyPiAccessToken } from '@/lib/pi-network';

const logger = {
  info: (msg: string, data?: any) => console.log(`[USER] ${msg}`, data || ''),
  error: (msg: string, error: any) => console.error(`[USER ERROR] ${msg}`, error),
};

// GET: Get Current User
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

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
        bio: true,
        language: true,
        country: true,
        city: true,
        trustScore: true,
        totalOrders: true,
        totalSales: true,
        totalSpent: true,
        totalEarned: true,
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
      data: { user: dbUser },
    });

  } catch (error) {
    logger.error('Get user error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update Current User
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const user = await verifyPiAccessToken(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const updatedUser = await prisma.user.update({
      where: { piUserId: user.uid },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        bio: body.bio,
        language: body.language,
        country: body.country,
        city: body.city,
      },
      select: {
        id: true,
        piUsername: true,
        firstName: true,
        lastName: true,
        bio: true,
        language: true,
        country: true,
        city: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });

  } catch (error) {
    logger.error('Update user error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
