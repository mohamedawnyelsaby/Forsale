/**
 * PI NETWORK PAYMENT APPROVAL ENDPOINT
 * Handles payment approval requests from frontend
 * apps/web/src/app/api/payments/pi/approve/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { approvePiPayment, verifyPiAccessToken } from '@/lib/pi-network';

