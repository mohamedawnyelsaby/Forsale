// ============================================
// 📄 FILENAME: ai.service.ts (FIXED)
// 📍 PATH: backend/src/services/ai.service.ts
// ============================================

import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class AIService {
  private readonly aiServiceUrl: string;
  private readonly aiServiceKey: string;

  constructor() {
    this.aiServiceUrl = config.AI_SERVICE_URL || 'https://api.example.com';
    this.aiServiceKey = config.AI_SERVICE_KEY || 'mock-key';
  }

  async analyzeProduct(data: {
    description?: string;
    images?: string[];
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/analyze`,
        data,
        {
          headers: {
            'X-API-Key': this.aiServiceKey
          },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('AI analysis failed:', error);
      return null;
    }
  }
  
  async getPriceRecommendation(productData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/price-recommendation`,
        productData,
        {
          headers: {
            'X-API-Key': this.aiServiceKey
          },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Price recommendation failed:', error);
      return null;
    }
  }
  
  async detectFraud(orderData: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/fraud-detection`,
        orderData,
        {
          headers: {
            'X-API-Key': this.aiServiceKey
          },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Fraud detection failed:', error);
      return { riskLevel: 'unknown' };
    }
  }
  
  async analyzeDispute(data: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/dispute-analysis`,
        data,
        {
          headers: {
            'X-API-Key': this.aiServiceKey
          },
          timeout: 10000
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Dispute analysis failed:', error);
      return null;
    }
  }
}
