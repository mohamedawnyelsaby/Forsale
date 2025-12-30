/**
 * PI NETWORK PAYMENT APPROVAL ENDPOINT
 * Handles payment approval requests from frontend
 * apps/web/src/app/api/payments/pi/approve/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { approvePiPayment, verifyPiAccessToken } from '@/lib/pi-network';

// ============================================
// SIMPLE LOGGER
// ============================================
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: (message: string, error?: any, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data || '');
  },
};

// ============================================
// REQUEST VALIDATION
// ============================================
interface ApprovePaymentRequest {
  paymentId: string;
}

function validateRequest(body: any): body is ApprovePaymentRequest {
  return (
    body &&
    typeof body === 'object' &&
    typeof body.paymentId === 'string' &&
    body.paymentId.length > 0
  );
}

// ============================================
// PAYMENT APPROVAL HANDLER
// ============================================
export async function POST(req: NextRequest) {
  try {
    // 1. Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Unauthorized - Missing access token' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer '

    // 2. Verify access token
    const user = await verifyPiAccessToken(accessToken);
    if (!user) {
      logger.warn('Invalid Pi Network access token');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid access token' },
        { status: 401 }
      );
    }

    logger.info('User authenticated', { userId: user.uid });

    // 3. Parse and validate request body
    const body = await req.json();
    if (!validateRequest(body)) {
      logger.warn('Invalid request body', { body });
      return NextResponse.json(
        { error: 'Bad Request - paymentId is required' },
        { status: 400 }
      );
    }

    const { paymentId } = body;

    logger.info('Payment approval
