"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const AppError_1 = require("../utils/AppError");
const PI_API_BASE = 'https://api.minepi.com';
class PiService {
    apiKey;
    appSecret;
    axiosInstance;
    MAX_RETRIES = 3;
    RETRY_DELAY = 1000;
    constructor() {
        this.apiKey = env_1.config.PI_API_KEY;
        this.appSecret = env_1.config.PI_APP_SECRET;
        if (!this.apiKey || !this.appSecret) {
            throw new Error('❌ Pi Network credentials not configured');
        }
        if (this.apiKey.length < 20) {
            throw new Error('❌ Invalid Pi API Key format');
        }
        this.axiosInstance = axios_1.default.create({
            baseURL: PI_API_BASE,
            timeout: 15000,
            headers: {
                'Authorization': `Key ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'PiApp/1.0'
            },
            validateStatus: (status) => status < 500
        });
        this.axiosInstance.interceptors.request.use((config) => {
            logger_1.logger.info(`📤 Pi API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('❌ Request interceptor error:', error);
            return Promise.reject(error);
        });
        this.axiosInstance.interceptors.response.use((response) => {
            logger_1.logger.info(`📥 Pi API Response: ${response.status} ${response.config.url}`);
            return response;
        }, (error) => {
            this.handleAxiosError(error);
            return Promise.reject(error);
        });
        logger_1.logger.info('✅ Pi Service initialized successfully');
    }
    handleAxiosError(error) {
        if (error.response) {
            logger_1.logger.error('❌ Pi API Error:', {
                status: error.response.status,
                data: error.response.data,
                url: error.config?.url
            });
        }
        else if (error.request) {
            logger_1.logger.error('❌ Pi API No Response:', {
                url: error.config?.url,
                timeout: error.code === 'ECONNABORTED'
            });
        }
        else {
            logger_1.logger.error('❌ Pi API Request Setup Error:', error.message);
        }
    }
    async retryRequest(requestFn, retries = this.MAX_RETRIES) {
        try {
            return await requestFn();
        }
        catch (error) {
            if (retries > 0 && this.isRetryableError(error)) {
                logger_1.logger.warn(`⚠️ Retrying request... (${this.MAX_RETRIES - retries + 1}/${this.MAX_RETRIES})`);
                await this.delay(this.RETRY_DELAY);
                return this.retryRequest(requestFn, retries - 1);
            }
            throw error;
        }
    }
    isRetryableError(error) {
        if (!error.response)
            return true;
        const status = error.response.status;
        return status === 429 || status >= 500;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async createPayment(data) {
        try {
            if (!data.amount || data.amount <= 0) {
                throw new AppError_1.AppError('Invalid payment amount', 400);
            }
            if (data.amount > 1000000) {
                throw new AppError_1.AppError('Amount exceeds maximum limit', 400);
            }
            if (!data.memo || data.memo.length < 3) {
                throw new AppError_1.AppError('Invalid payment memo', 400);
            }
            if (!data.metadata.productId || !data.metadata.userId) {
                throw new AppError_1.AppError('Missing required metadata', 400);
            }
            const nonce = crypto_1.default.randomBytes(16).toString('hex');
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
            const response = await this.retryRequest(async () => {
                const res = await this.axiosInstance.post('/v2/payments', payload);
                if (res.status !== 200 && res.status !== 201) {
                    throw new AppError_1.AppError(`Pi API returned status ${res.status}`, res.status);
                }
                return res;
            });
            if (!response.data.identifier) {
                throw new AppError_1.AppError('Invalid payment response from Pi', 500);
            }
            logger_1.logger.info(`✅ Payment created: ${response.data.identifier} | Amount: ${data.amount} Pi`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Create payment failed:', {
                error: error.message,
                data: error.response?.data
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError(error.response?.data?.message || 'Failed to create Pi payment', error.response?.status || 500);
        }
    }
    async approvePayment(paymentId) {
        try {
            if (!paymentId || paymentId.length < 10) {
                throw new AppError_1.AppError('Invalid payment ID', 400);
            }
            const payment = await this.getPayment(paymentId);
            if (payment.status !== 'pending') {
                throw new AppError_1.AppError(`Cannot approve payment with status: ${payment.status}`, 400);
            }
            const response = await this.retryRequest(async () => {
                const res = await this.axiosInstance.post(`/v2/payments/${paymentId}/approve`, {});
                if (res.status !== 200) {
                    throw new AppError_1.AppError(`Approval failed: ${res.status}`, res.status);
                }
                return res;
            });
            logger_1.logger.info(`✅ Payment approved: ${paymentId}`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Approve payment failed:', {
                paymentId,
                error: error.message
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to approve Pi payment', error.response?.status || 500);
        }
    }
    async completePayment(paymentId, txid) {
        try {
            if (!paymentId || !txid) {
                throw new AppError_1.AppError('Payment ID and TXID are required', 400);
            }
            if (txid.length < 40) {
                throw new AppError_1.AppError('Invalid transaction ID format', 400);
            }
            const payment = await this.getPayment(paymentId);
            if (payment.status !== 'completed') {
                throw new AppError_1.AppError(`Payment not ready for completion. Status: ${payment.status}`, 400);
            }
            if (payment.transaction?.txid !== txid) {
                logger_1.logger.error('TXID mismatch:', {
                    expected: payment.transaction?.txid,
                    received: txid
                });
                throw new AppError_1.AppError('Transaction ID mismatch', 400);
            }
            const response = await this.retryRequest(async () => {
                const res = await this.axiosInstance.post(`/v2/payments/${paymentId}/complete`, { txid });
                if (res.status !== 200) {
                    throw new AppError_1.AppError(`Completion failed: ${res.status}`, res.status);
                }
                return res;
            });
            logger_1.logger.info(`✅ Payment completed: ${paymentId} | TXID: ${txid}`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Complete payment failed:', {
                paymentId,
                txid,
                error: error.message
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to complete Pi payment', error.response?.status || 500);
        }
    }
    async cancelPayment(paymentId) {
        try {
            if (!paymentId) {
                throw new AppError_1.AppError('Payment ID required', 400);
            }
            const response = await this.retryRequest(async () => {
                const res = await this.axiosInstance.post(`/v2/payments/${paymentId}/cancel`, {});
                if (res.status !== 200) {
                    throw new AppError_1.AppError(`Cancellation failed: ${res.status}`, res.status);
                }
                return res;
            });
            logger_1.logger.info(`✅ Payment cancelled: ${paymentId}`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Cancel payment failed:', {
                paymentId,
                error: error.message
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to cancel Pi payment', error.response?.status || 500);
        }
    }
    paymentCache = new Map();
    CACHE_TTL = 30000;
    async getPayment(paymentId) {
        try {
            if (!paymentId) {
                throw new AppError_1.AppError('Payment ID required', 400);
            }
            const cached = this.paymentCache.get(paymentId);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                logger_1.logger.debug(`📦 Cache hit for payment: ${paymentId}`);
                return cached.data;
            }
            const response = await this.retryRequest(async () => {
                const res = await this.axiosInstance.get(`/v2/payments/${paymentId}`);
                if (res.status !== 200) {
                    throw new AppError_1.AppError(`Get payment failed: ${res.status}`, res.status);
                }
                return res;
            });
            this.paymentCache.set(paymentId, {
                data: response.data,
                timestamp: Date.now()
            });
            this.clearOldCache();
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Get payment failed:', {
                paymentId,
                error: error.message
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to get Pi payment details', error.response?.status || 500);
        }
    }
    clearOldCache() {
        const now = Date.now();
        for (const [key, value] of this.paymentCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.paymentCache.delete(key);
            }
        }
    }
    verifyPaymentCallback(paymentId, txid, signature) {
        try {
            if (!paymentId || !txid || !signature) {
                logger_1.logger.error('❌ Missing callback parameters');
                return false;
            }
            if (signature.length !== 64) {
                logger_1.logger.error('❌ Invalid signature format');
                return false;
            }
            const message = `${paymentId}|${txid}`;
            const expectedSignature = crypto_1.default
                .createHmac('sha256', this.appSecret)
                .update(message)
                .digest('hex');
            let isValid = false;
            try {
                isValid = crypto_1.default.timingSafeEqual(Buffer.from(signature.toLowerCase()), Buffer.from(expectedSignature.toLowerCase()));
            }
            catch (error) {
                logger_1.logger.error('❌ Signature comparison failed:', error);
                return false;
            }
            if (!isValid) {
                logger_1.logger.warn(`⚠️ Invalid signature for payment ${paymentId}`);
                logger_1.logger.debug('Expected:', expectedSignature);
                logger_1.logger.debug('Received:', signature);
            }
            else {
                logger_1.logger.info(`✅ Signature verified for payment ${paymentId}`);
            }
            return isValid;
        }
        catch (error) {
            logger_1.logger.error('❌ Signature verification error:', error);
            return false;
        }
    }
    async handleWebhook(payload) {
        try {
            const { paymentId, txid, signature } = payload;
            logger_1.logger.info(`📥 Processing webhook for payment: ${paymentId}`);
            const signatureValid = this.verifyPaymentCallback(paymentId, txid, signature);
            if (!signatureValid) {
                logger_1.logger.error(`❌ Webhook rejected: Invalid signature for ${paymentId}`);
                return false;
            }
            const payment = await this.getPayment(paymentId);
            if (!payment) {
                logger_1.logger.error(`❌ Payment not found: ${paymentId}`);
                return false;
            }
            if (payment.status !== 'completed') {
                logger_1.logger.warn(`⚠️ Payment ${paymentId} not completed yet. Status: ${payment.status}`);
                return false;
            }
            if (payment.transaction?.txid !== txid) {
                logger_1.logger.error(`❌ TXID mismatch for ${paymentId}:`, {
                    expected: payment.transaction?.txid,
                    received: txid
                });
                return false;
            }
            if (payment.transaction && !payment.transaction.verified) {
                logger_1.logger.warn(`⚠️ Transaction not verified on blockchain: ${txid}`);
            }
            logger_1.logger.info(`✅ Webhook verified successfully for payment ${paymentId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('❌ Webhook handling failed:', error);
            return false;
        }
    }
    async verifyUserToken(accessToken) {
        try {
            if (!accessToken || accessToken.length < 20) {
                throw new AppError_1.AppError('Invalid access token', 401);
            }
            const response = await this.axiosInstance.get('/v2/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.status !== 200) {
                throw new AppError_1.AppError('Token verification failed', 401);
            }
            logger_1.logger.info(`✅ User token verified: ${response.data.username}`);
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('❌ Token verification failed:', error.message);
            throw new AppError_1.AppError('Invalid Pi token', 401);
        }
    }
    async healthCheck() {
        try {
            const response = await this.axiosInstance.get('/v2/payments?limit=1', {
                timeout: 5000
            });
            const isHealthy = response.status === 200;
            if (isHealthy) {
                logger_1.logger.info('✅ Pi Network API is healthy');
            }
            else {
                logger_1.logger.warn('⚠️ Pi Network API health check failed');
            }
            return isHealthy;
        }
        catch (error) {
            logger_1.logger.error('❌ Pi Network API is unreachable');
            return false;
        }
    }
    destroy() {
        this.paymentCache.clear();
        logger_1.logger.info('🧹 Pi Service resources cleaned up');
    }
}
exports.PiService = PiService;
//# sourceMappingURL=pi.service.js.map