/**
 * PI NETWORK LIBRARY - HELPER FUNCTIONS
 * Backend utilities for Pi Network integration
 * @security MAXIMUM
 */

// apps/web/src/lib/pi-network.ts

import { logger } from '@forsale/logger';
import { env } from '@forsale/config/env';

// ============================================
// TYPES
// ============================================

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiPaymentDTO {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
}

// ============================================
// CONFIGURATION
// ============================================

const PI_API_URL = env.PI_API_URL || 'https://api.minepi.com';
const PI_API_KEY = env.PI_API_KEY;
const PI_NETWORK_MODE = env.NEXT_PUBLIC_PI_NETWORK_MODE || 'testnet';

// ============================================
// ACCESS TOKEN VERIFICATION
// ============================================

/**
 * Verify Pi Network access token and get user info
 */
export async function verifyPiAccessToken(
  accessToken: string
): Promise<PiUser | null> {
  try {
    const response = await fetch(`${PI_API_URL}/v2/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      logger.warn('Pi access token verification failed', {
        status: response.status,
      });
      return null;
    }

    const user = await response.json();

    logger.info('Pi access token verified', {
      userId: user.uid,
      username: user.username,
    });

    return {
      uid: user.uid,
      username: user.username,
    };
  } catch (error) {
    logger.error('Pi access token verification error', error as Error);
    return null;
  }
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

/**
 * Get payment details from Pi Network
 */
export async function getPiPayment(
  paymentId: string
): Promise<any | null> {
  try {
    const response = await fetch(`${PI_API_URL}/v2/payments/${paymentId}`, {
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
      },
    });

    if (!response.ok) {
      logger.error('Failed to get Pi payment', undefined, {
        paymentId,
        status: response.status,
      });
      return null;
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching Pi payment', error as Error, { paymentId });
    return null;
  }
}

/**
 * Approve payment on Pi Network
 */
export async function approvePiPayment(
  paymentId: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['X-Access-Token'] = accessToken;
    }

    const response = await fetch(
      `${PI_API_URL}/v2/payments/${paymentId}/approve`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      logger.error('Failed to approve Pi payment', undefined, {
        paymentId,
        status: response.status,
      });
      return false;
    }

    logger.info('Pi payment approved', { paymentId });
    return true;
  } catch (error) {
    logger.error('Error approving Pi payment', error as Error, { paymentId });
    return false;
  }
}

/**
 * Complete payment on Pi Network
 */
export async function completePiPayment(
  paymentId: string,
  txid: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['X-Access-Token'] = accessToken;
    }

    const response = await fetch(
      `${PI_API_URL}/v2/payments/${paymentId}/complete`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ txid }),
      }
    );

    if (!response.ok) {
      logger.error('Failed to complete Pi payment', undefined, {
        paymentId,
        txid,
        status: response.status,
      });
      return false;
    }

    logger.info('Pi payment completed', { paymentId, txid });
    return true;
  } catch (error) {
    logger.error('Error completing Pi payment', error as Error, {
      paymentId,
      txid,
    });
    return false;
  }
}

/**
 * Cancel payment on Pi Network
 */
export async function cancelPiPayment(
  paymentId: string,
  accessToken?: string
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Key ${PI_API_KEY}`,
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['X-Access-Token'] = accessToken;
    }

    const response = await fetch(
      `${PI_API_URL}/v2/payments/${paymentId}/cancel`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      logger.error('Failed to cancel Pi payment', undefined, {
        paymentId,
        status: response.status,
      });
      return false;
    }

    logger.info('Pi payment cancelled', { paymentId });
    return true;
  } catch (error) {
    logger.error('Error cancelling Pi payment', error as Error, { paymentId });
    return false;
  }
}

// ============================================
// TRANSACTION VERIFICATION
// ============================================

/**
 * Verify transaction on Pi blockchain
 */
export async function verifyPiTransaction(
  txid: string,
  expectedAmount?: number
): Promise<boolean> {
  try {
    const response = await fetch(
      `${PI_API_URL}/v2/blockchain/transactions/${txid}`,
      {
        headers: {
          Authorization: `Key ${PI_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const transaction = await response.json();

    // Check if transaction is verified
    if (!transaction.verified) {
      logger.warn('Pi transaction not verified', { txid });
      return false;
    }

    // Check amount if provided
    if (expectedAmount !== undefined) {
      if (Math.abs(transaction.amount - expectedAmount) > 0.01) {
        logger.warn('Pi transaction amount mismatch', {
          txid,
          expected: expectedAmount,
          actual: transaction.amount,
        });
        return false;
      }
    }

    logger.info('Pi transaction verified', {
      txid,
      amount: transaction.amount,
    });

    return true;
  } catch (error) {
    logger.error('Error verifying Pi transaction', error as Error, { txid });
    return false;
  }
}

// ============================================
// WALLET OPERATIONS
// ============================================

/**
 * Get wallet balance from Pi Network
 */
export async function getPiWalletBalance(
  accessToken: string
): Promise<number | null> {
  try {
    const response = await fetch(`${PI_API_URL}/v2/me/balance`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.balance;
  } catch (error) {
    logger.error('Error fetching Pi wallet balance', error as Error);
    return null;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert amount from USD to Pi (approximate)
 */
export function convertUSDToPi(usdAmount: number): number {
  // Get current Pi to USD rate from your database or cache
  // This is a placeholder - implement actual rate fetching
  const PI_TO_USD_RATE = 1.0; // Example: 1 Pi = $1
  return usdAmount / PI_TO_USD_RATE;
}

/**
 * Convert amount from Pi to USD (approximate)
 */
export function convertPiToUSD(piAmount: number): number {
  // Get current Pi to USD rate from your database or cache
  const PI_TO_USD_RATE = 1.0; // Example: 1 Pi = $1
  return piAmount * PI_TO_USD_RATE;
}

/**
 * Format Pi amount for display
 */
export function formatPiAmount(amount: number): string {
  return `π ${amount.toFixed(4)}`;
}

/**
 * Validate Pi payment amount
 */
export function isValidPiAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000 && Number.isFinite(amount);
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Check if user can create a new payment
 */
export async function canCreatePayment(userId: string): Promise<boolean> {
  // Implement rate limiting logic
  // Check last payment time, daily limits, etc.
  return true;
}

// ============================================
// WEBHOOKS
// ============================================

/**
 * Verify Pi Network webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // Implement webhook signature verification
  // Use your Pi Network API secret
  return true;
}
