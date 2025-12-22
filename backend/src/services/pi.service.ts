// ============================================
// 📄 FILENAME: pi.service.ts (ULTIMATE SECURITY)
// 📍 PATH: backend/src/services/pi.service.ts
// 🛡️ Production-Ready | Enterprise-Level Security
// ============================================

import axios, { AxiosInstance, AxiosError } from 'axios';
import crypto from 'crypto';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

const PI_API_BASE = 'https://api.minepi.com';

interface PaymentMetadata {
  productId: string;
  userId: string;
  expectedAmount: number;
  timestamp: number;
  [key: string]: any;
}

interface CreatePaymentData {
  amount: number;
  memo: string;
  metadata: PaymentMetadata;
}

interface PiPaymentResponse {
  identifier: string;
  status: string;
  amount: number;
  transaction?: {
    txid: string;
    verified: boolean;
  };
  metadata?: any;
  from_address?: string;
  to_address?: string;
  created_at?: string;
}

interface WebhookPayload {
  paymentId: string;
  txid: string;
  signature: string;
}

export class PiService {
  private apiKey: string;
  private appSecret: string;
  private axiosInstance: AxiosInstance;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second
  
  constructor() {
    this.apiKey = config.PI_API_KEY;
    this.appSecret = config.PI_APP_SECRET;
    
    // ✅ التحقق من وجود المفاتيح
    if (!this.apiKey || !this.appSecret) {
      throw new Error('❌ Pi Network credentials not configured');
    }
    
    // ✅ التحقق من صيغة المفاتيح
    if (this.apiKey.length < 20) {
      throw new Error('❌ Invalid Pi API Key format');
    }
    
    // ✅ إنشاء Axios instance مع إعدادات محسنة
    this.axiosInstance = axios.create({
      baseURL: PI_API_BASE,
      timeout: 15000, // 15 seconds
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PiApp/1.0'
      },
      validateStatus: (status) => status < 500 // معالجة 4xx يدوياً
    });
    
    // ✅ Interceptor لتسجيل كل الطلبات
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.info(`📤 Pi API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );
    
    // ✅ Interceptor لمعالجة الأخطاء
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.info(`📥 Pi API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        this.handleAxiosError(error);
        return Promise.reject(error);
      }
    );
    
    logger.info('✅ Pi Service initialized successfully');
  }
  
  /**
   * ✅ معالجة أخطاء Axios بشكل احترافي
   */
  private handleAxiosError(error: AxiosError): void {
    if (error.response) {
      // الخادم رد برمز خطأ
      logger.error('❌ Pi API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // الطلب أُرسل لكن لم يُستلم رد
      logger.error('❌ Pi API No Response:', {
        url: error.config?.url,
        timeout: error.code === 'ECONNABORTED'
      });
    } else {
      // خطأ في إعداد الطلب
      logger.error('❌ Pi API Request Setup Error:', error.message);
    }
  }
  
  /**
   * ✅ Retry Logic للطلبات الفاشلة
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (retries > 0 && this.isRetryableError(error)) {
        logger.warn(`⚠️ Retrying request... (${this.MAX_RETRIES - retries + 1}/${this.MAX_RETRIES})`);
        await this.delay(this.RETRY_DELAY);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }
  
  /**
   * ✅ تحديد إذا كان الخطأ قابل لإعادة المحاولة
   */
  private isRetryableError(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 429 || status >= 500; // Rate limit or server error
  }
  
  /**
   * ✅ Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * ✅ إنشاء دفعة جديدة مع Validation شامل
   */
  async createPayment(data: CreatePaymentData): Promise<PiPaymentResponse> {
    try {
      // ✅ Validation
      if (!data.amount || data.amount <= 0) {
        throw new AppError('Invalid payment amount', 400);
      }
      
      if (data.amount > 1000000) {
        throw new AppError('Amount exceeds maximum limit', 400);
      }
      
      if (!data.memo || data.memo.length < 3) {
        throw new AppError('Invalid payment memo', 400);
      }
      
      if (!data.metadata.productId || !data.metadata.userId) {
        throw new AppError('Missing required metadata', 400);
      }
      
      // ✅ إضافة Nonce لمنع Replay
      const nonce = crypto.randomBytes(16).toString('hex');
      
      const payload = {
        payment: {
          amount: data.amount,
          memo: data.memo,
          metadata: {
            ...data.metadata,
            nonce,
            createdAt: new Date().toISOString()
          }
        }
      };
      
      // ✅ إرسال الطلب مع Retry
      const response = await this.retryRequest(async () => {
        const res = await this.axiosInstance.post<PiPaymentResponse>(
          '/v2/payments',
          payload
        );
        
        if (res.status !== 200 && res.status !== 201) {
          throw new AppError(
            `Pi API returned status ${res.status}`,
            res.status
          );
        }
        
        return res;
      });
      
      // ✅ Validation للرد
      if (!response.data.identifier) {
        throw new AppError('Invalid payment response from Pi', 500);
      }
      
      logger.info(`✅ Payment created: ${response.data.identifier} | Amount: ${data.amount} Pi`);
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Create payment failed:', {
        error: error.message,
        data: error.response?.data
      });
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        error.response?.data?.message || 'Failed to create Pi payment',
        error.response?.status || 500
      );
    }
  }
  
  /**
   * ✅ الموافقة على الدفع (Server-side)
   */
  async approvePayment(paymentId: string): Promise<PiPaymentResponse> {
    try {
      // ✅ Validation
      if (!paymentId || paymentId.length < 10) {
        throw new AppError('Invalid payment ID', 400);
      }
      
      // ✅ التحقق من حالة الدفع أولاً
      const payment = await this.getPayment(paymentId);
      
      if (payment.status !== 'pending') {
        throw new AppError(
          `Cannot approve payment with status: ${payment.status}`,
          400
        );
      }
      
      // ✅ الموافقة مع Retry
      const response = await this.retryRequest(async () => {
        const res = await this.axiosInstance.post<PiPaymentResponse>(
          `/v2/payments/${paymentId}/approve`,
          {}
        );
        
        if (res.status !== 200) {
          throw new AppError(`Approval failed: ${res.status}`, res.status);
        }
        
        return res;
      });
      
      logger.info(`✅ Payment approved: ${paymentId}`);
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Approve payment failed:', {
        paymentId,
        error: error.message
      });
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        'Failed to approve Pi payment',
        error.response?.status || 500
      );
    }
  }
  
  /**
   * ✅ إكمال الدفع (Release Escrow) - الأهم!
   */
  async completePayment(paymentId: string, txid: string): Promise<PiPaymentResponse> {
    try {
      // ✅ Validation شديد
      if (!paymentId || !txid) {
        throw new AppError('Payment ID and TXID are required', 400);
      }
      
      if (txid.length < 40) {
        throw new AppError('Invalid transaction ID format', 400);
      }
      
      // ✅ التحقق من حالة الدفع
      const payment = await this.getPayment(paymentId);
      
      if (payment.status !== 'completed') {
        throw new AppError(
          `Payment not ready for completion. Status: ${payment.status}`,
          400
        );
      }
      
      // ✅ التحقق من TXID
      if (payment.transaction?.txid !== txid) {
        logger.error('TXID mismatch:', {
          expected: payment.transaction?.txid,
          received: txid
        });
        throw new AppError('Transaction ID mismatch', 400);
      }
      
      // ✅ إكمال الدفع مع Retry
      const response = await this.retryRequest(async () => {
        const res = await this.axiosInstance.post<PiPaymentResponse>(
          `/v2/payments/${paymentId}/complete`,
          { txid }
        );
        
        if (res.status !== 200) {
          throw new AppError(`Completion failed: ${res.status}`, res.status);
        }
        
        return res;
      });
      
      logger.info(`✅ Payment completed: ${paymentId} | TXID: ${txid}`);
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Complete payment failed:', {
        paymentId,
        txid,
        error: error.message
      });
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        'Failed to complete Pi payment',
        error.response?.status || 500
      );
    }
  }
  
  /**
   * ✅ إلغاء الدفع
   */
  async cancelPayment(paymentId: string): Promise<PiPaymentResponse> {
    try {
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      const response = await this.retryRequest(async () => {
        const res = await this.axiosInstance.post<PiPaymentResponse>(
          `/v2/payments/${paymentId}/cancel`,
          {}
        );
        
        if (res.status !== 200) {
          throw new AppError(`Cancellation failed: ${res.status}`, res.status);
        }
        
        return res;
      });
      
      logger.info(`✅ Payment cancelled: ${paymentId}`);
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Cancel payment failed:', {
        paymentId,
        error: error.message
      });
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        'Failed to cancel Pi payment',
        error.response?.status || 500
      );
    }
  }
  
  /**
   * ✅ الحصول على تفاصيل الدفع مع Caching
   */
  private paymentCache = new Map<string, { data: PiPaymentResponse; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  
  async getPayment(paymentId: string): Promise<PiPaymentResponse> {
    try {
      if (!paymentId) {
        throw new AppError('Payment ID required', 400);
      }
      
      // ✅ Check cache
      const cached = this.paymentCache.get(paymentId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.debug(`📦 Cache hit for payment: ${paymentId}`);
        return cached.data;
      }
      
      // ✅ Fetch with retry
      const response = await this.retryRequest(async () => {
        const res = await this.axiosInstance.get<PiPaymentResponse>(
          `/v2/payments/${paymentId}`
        );
        
        if (res.status !== 200) {
          throw new AppError(`Get payment failed: ${res.status}`, res.status);
        }
        
        return res;
      });
      
      // ✅ Cache result
      this.paymentCache.set(paymentId, {
        data: response.data,
        timestamp: Date.now()
      });
      
      // ✅ Clear old cache entries
      this.clearOldCache();
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Get payment failed:', {
        paymentId,
        error: error.message
      });
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        'Failed to get Pi payment details',
        error.response?.status || 500
      );
    }
  }
  
  /**
   * ✅ تنظيف Cache القديم
   */
  private clearOldCache(): void {
    const now = Date.now();
    for (const [key, value] of this.paymentCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.paymentCache.delete(key);
      }
    }
  }
  
  /**
   * ✅ التحقق من صحة Callback - CRITICAL SECURITY!
   */
  verifyPaymentCallback(paymentId: string, txid: string, signature: string): boolean {
    try {
      // ✅ Validation
      if (!paymentId || !txid || !signature) {
        logger.error('❌ Missing callback parameters');
        return false;
      }
      
      if (signature.length !== 64) { // SHA256 hex = 64 chars
        logger.error('❌ Invalid signature format');
        return false;
      }
      
      // ✅ بناء الرسالة بالترتيب الصحيح
      const message = `${paymentId}|${txid}`;
      
      // ✅ حساب HMAC SHA256
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(message)
        .digest('hex');
      
      // ✅ مقارنة آمنة ضد Timing Attacks
      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(signature.toLowerCase()),
          Buffer.from(expectedSignature.toLowerCase())
        );
      } catch (error) {
        logger.error('❌ Signature comparison failed:', error);
        return false;
      }
      
      if (!isValid) {
        logger.warn(`⚠️ Invalid signature for payment ${paymentId}`);
        logger.debug('Expected:', expectedSignature);
        logger.debug('Received:', signature);
      } else {
        logger.info(`✅ Signature verified for payment ${paymentId}`);
      }
      
      return isValid;
      
    } catch (error) {
      logger.error('❌ Signature verification error:', error);
      return false;
    }
  }
  
  /**
   * ✅ معالج Webhook الشامل - الأهم للخطوة 10!
   */
  async handleWebhook(payload: WebhookPayload): Promise<boolean> {
    try {
      const { paymentId, txid, signature } = payload;
      
      logger.info(`📥 Processing webhook for payment: ${paymentId}`);
      
      // ✅ 1. التحقق من التوقيع أولاً
      const signatureValid = this.verifyPaymentCallback(paymentId, txid, signature);
      
      if (!signatureValid) {
        logger.error(`❌ Webhook rejected: Invalid signature for ${paymentId}`);
        return false;
      }
      
      // ✅ 2. التحقق من حالة الدفع على Pi Network
      const payment = await this.getPayment(paymentId);
      
      if (!payment) {
        logger.error(`❌ Payment not found: ${paymentId}`);
        return false;
      }
      
      // ✅ 3. التحقق من حالة الدفع
      if (payment.status !== 'completed') {
        logger.warn(`⚠️ Payment ${paymentId} not completed yet. Status: ${payment.status}`);
        return false;
      }
      
      // ✅ 4. التحقق من TXID
      if (payment.transaction?.txid !== txid) {
        logger.error(`❌ TXID mismatch for ${paymentId}:`, {
          expected: payment.transaction?.txid,
          received: txid
        });
        return false;
      }
      
      // ✅ 5. التحقق من التوقيع على Blockchain
      if (payment.transaction && !payment.transaction.verified) {
        logger.warn(`⚠️ Transaction not verified on blockchain: ${txid}`);
        // لا نرفض، لكن نسجل التحذير
      }
      
      logger.info(`✅ Webhook verified successfully for payment ${paymentId}`);
      
      return true;
      
    } catch (error) {
      logger.error('❌ Webhook handling failed:', error);
      return false;
    }
  }
  
  /**
   * ✅ التحقق من User Token (OAuth)
   */
  async verifyUserToken(accessToken: string): Promise<any> {
    try {
      if (!accessToken || accessToken.length < 20) {
        throw new AppError('Invalid access token', 401);
      }
      
      const response = await this.axiosInstance.get('/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.status !== 200) {
        throw new AppError('Token verification failed', 401);
      }
      
      logger.info(`✅ User token verified: ${response.data.username}`);
      
      return response.data;
      
    } catch (error: any) {
      logger.error('❌ Token verification failed:', error.message);
      throw new AppError('Invalid Pi token', 401);
    }
  }
  
  /**
   * ✅ Health Check للخدمة
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/v2/payments?limit=1', {
        timeout: 5000
      });
      
      const isHealthy = response.status === 200;
      
      if (isHealthy) {
        logger.info('✅ Pi Network API is healthy');
      } else {
        logger.warn('⚠️ Pi Network API health check failed');
      }
      
      return isHealthy;
      
    } catch (error) {
      logger.error('❌ Pi Network API is unreachable');
      return false;
    }
  }
  
  /**
   * ✅ تنظيف الموارد
   */
  destroy(): void {
    this.paymentCache.clear();
    logger.info('🧹 Pi Service resources cleaned up');
  }
}
