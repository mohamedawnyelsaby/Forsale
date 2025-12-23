"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AIService {
    aiServiceUrl;
    aiServiceKey;
    constructor() {
        this.aiServiceUrl = env_1.config.AI_SERVICE_URL || 'https://api.example.com';
        this.aiServiceKey = env_1.config.AI_SERVICE_KEY || 'mock-key';
    }
    async analyzeProduct(data) {
        try {
            const response = await axios_1.default.post(`${this.aiServiceUrl}/analyze`, data, {
                headers: {
                    'X-API-Key': this.aiServiceKey
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('AI analysis failed:', error);
            return null;
        }
    }
    async getPriceRecommendation(productData) {
        try {
            const response = await axios_1.default.post(`${this.aiServiceUrl}/price-recommendation`, productData, {
                headers: {
                    'X-API-Key': this.aiServiceKey
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Price recommendation failed:', error);
            return null;
        }
    }
    async detectFraud(orderData) {
        try {
            const response = await axios_1.default.post(`${this.aiServiceUrl}/fraud-detection`, orderData, {
                headers: {
                    'X-API-Key': this.aiServiceKey
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Fraud detection failed:', error);
            return { riskLevel: 'unknown' };
        }
    }
    async analyzeDispute(data) {
        try {
            const response = await axios_1.default.post(`${this.aiServiceUrl}/dispute-analysis`, data, {
                headers: {
                    'X-API-Key': this.aiServiceKey
                },
                timeout: 10000
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error('Dispute analysis failed:', error);
            return null;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map