// ============================================
// 📄 FILENAME: pi.service.ts
// 📍 PATH: backend/src/services/pi.service.ts
// ============================================

import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

const PI_API_BASE = 'https://api.minepi.com';

export class PiService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = config.PI_API_KEY;
  }
  
  /**
   * Create a payment request
   */
  async createPayment(data: {
    amount: number;
    memo: string;
    metadata: any;
  }) {
    try {
      const response = await axios.post(
        `${PI_API_BASE}/v2/payments`,
        {
          payment: {
            amount: data.amount,
            memo: data.memo,
            metadata: data.metadata
          }
        },
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info('Pi payment created:', response.data);
      return response.data;
    } catch (error: any) {
      logger.error('Pi payment creation failed:', error.response?.data || error);
      throw new AppError('Failed to create Pi payment', 500);
    }
  }
  
  /**
   * Approve a payment (Server-side approval)
   */
  async approvePayment(paymentId: string) {
    try {
      const response = await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`
          }
        }
      );
      
      logger.info('Pi payment approved:', paymentId);
      return response.data;
    } catch (error: any) {
      logger.error('Pi payment approval failed:', error.response?.data || error);
      throw new AppError('Failed to approve Pi payment', 500);
    }
  }
  
  /**
   * Complete a payment (Release escrow)
   */
  async completePayment(paymentId: string, txid: string) {
    try {
      const response = await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
        { txid },
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`
          }
        }
      );
      
      logger.info('Pi payment completed:', paymentId);
      return response.data;
    } catch (error: any) {
      logger.error('Pi payment completion failed:', error.response?.data || error);
      throw new AppError('Failed to complete Pi payment', 500);
    }
  }
  
  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string) {
    try {
      const response = await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`
          }
        }
      );
      
      logger.info('Pi payment cancelled:', paymentId);
      return response.data;
    } catch (error: any) {
      logger.error('Pi payment cancellation failed:', error.response?.data || error);
      throw new AppError('Failed to cancel Pi payment', 500);
    }
  }
  
  /**
   * Get payment details
   */
  async getPayment(paymentId: string) {
    try {
      const response = await axios.get(
        `${PI_API_BASE}/v2/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Pi payment:', error.response?.data || error);
      throw new AppError('Failed to get Pi payment details', 500);
    }
  }
  
  /**
   * Verify payment callback signature
   */
  verifyPaymentCallback(paymentId: string, txid: string, signature: string): boolean {
    // TODO: Implement signature verification using Pi SDK
    // This is critical for security
    return true; // Placeholder
  }
}
