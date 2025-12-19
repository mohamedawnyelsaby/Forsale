// ============================================
// 📄 FILENAME: ai.service.ts
// 📍 PATH: backend/src/services/ai.service.ts
// ============================================

import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class AIService {
  async analyzeProduct(data: {
    description?: string;
    images?: string[];
  }) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/analyze`,
        data,
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return null;
    }
  }
  
  async getPriceRecommendation(productData: any) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/price-recommendation`,
        productData,
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Price recommendation failed:', error);
      return null;
    }
  }
  
  async detectFraud(orderData: any) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/fraud-detection`,
        orderData,
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Fraud detection failed:', error);
      return { riskLevel: 'unknown' };
    }
  }
  
  async analyzeDispute(data: any) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/dispute-analysis`,
        data,
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Dispute analysis failed:', error);
      return null;
    }
  }
}
