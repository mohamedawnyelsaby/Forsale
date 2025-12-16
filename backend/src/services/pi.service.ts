// ============================================
// 📄 FILENAME: pi.service.ts (SECURED)
// 📍 PATH: backend/src/services/pi.service.ts
// ============================================

import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

const PI_API_BASE = 'https://api.minepi.com';

export class PiService {
  private apiKey: string;
  private appSecret: string;
  
  constructor() {
    this.apiKey = config.PI_API_KEY;
    this.appSecret = config.PI_APP_SECRET;
    
    if (!this.apiKey || !this.appSecret) {
      throw new Error('Pi Network credentials not configured');
    }
    
    logger.info('✅ Pi Service initialized');
  }
  
  /**
   * إنشاء دفعة جديدة
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
      
      logger.info('✅ Pi payment created:', response.data.identifier);
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Pi payment creation failed:', error.response?.data || error);
      throw new AppError('Failed to create Pi payment', 500);
    }
  }
  
  /**
   * الموافقة على الدفع (Server-side)
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
      
      logger.info('✅ Pi payment approved:', paymentId);
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Pi payment approval failed:', error.response?.data || error);
      throw new AppError('Failed to approve Pi payment', 500);
    }
  }
  
  /**
   * إكمال الدفع (Release Escrow)
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
      
      logger.info('✅ Pi payment completed:', paymentId);
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Pi payment completion failed:', error.response?.data || error);
      throw new AppError('Failed to complete Pi payment', 500);
    }
  }
  
  /**
   * إلغاء الدفع
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
      
      logger.info('✅ Pi payment cancelled:', paymentId);
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Pi payment cancellation failed:', error.response?.data || error);
      throw new AppError('Failed to cancel Pi payment', 500);
    }
  }
  
  /**
   * الحصول على تفاصيل الدفع
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
      logger.error('❌ Failed to get Pi payment:', error.response?.data || error);
      throw new AppError('Failed to get Pi payment details', 500);
    }
  }
  
  /**
   * ✅ التحقق من صحة Callback (FIXED - CRITICAL)
   * 
   * هذه الدالة كانت ترجع true دائماً = خطر أمني!
   * الآن تتحقق من التوقيع الحقيقي
   */
  verifyPaymentCallback(paymentId: string, txid: string, signature: string): boolean {
    try {
      // بناء النص المتوقع للتوقيع
      const message = `${paymentId}|${txid}`;
      
      // حساب HMAC باستخدام App Secret
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(message)
        .digest('hex');
      
      // مقارنة التواقيع
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
      
      if (!isValid) {
        logger.warn(`⚠️ Invalid Pi callback signature for payment ${paymentId}`);
      }
      
      return isValid;
      
    } catch (error) {
      logger.error('❌ Signature verification error:', error);
      return false;
    }
  }
  
  /**
   * التحقق من صحة User Token (للـ OAuth)
   */
  async verifyUserToken(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `${PI_API_BASE}/v2/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      return response.data;
      
    } catch (error) {
      logger.error('❌ Token verification failed:', error);
      throw new AppError('Invalid Pi token', 401);
    }
  }
  
  /**
   * ✅ Webhook Handler - معالجة آمنة لـ Callbacks
   */
  async handleWebhook(payload: {
    paymentId: string;
    txid: string;
    signature: string;
  }): Promise<boolean> {
    // 1. التحقق من التوقيع أولاً
    const isValid = this.verifyPaymentCallback(
      payload.paymentId,
      payload.txid,
      payload.signature
    );
    
    if (!isValid) {
      logger.error('❌ Webhook rejected: Invalid signature');
      return false;
    }
    
    // 2. التحقق من حالة الدفع من Pi Network
    const payment = await this.getPayment(payload.paymentId);
    
    if (payment.status !== 'completed') {
      logger.warn(`⚠️ Payment ${payload.paymentId} not completed yet`);
      return false;
    }
    
    // 3. التحقق من عدم معالجة نفس الـ Webhook مرتين
    // (سيتم تطبيقه في الـ Controller)
    
    logger.info(`✅ Webhook verified for payment ${payload.paymentId}`);
    return true;
  }
}
