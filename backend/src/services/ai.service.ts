// ============================================
// 📄 FILENAME: ai.service.ts
// 📍 PATH: backend/src/services/ai.service.ts
// 🌍 GLOBAL EDITION - Enhanced for worldwide scalability
// ============================================

import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * @class AIService
 * @description Advanced AI service with caching, fallbacks, and global language support
 * @version 2.1.0
 */
export class AIService {
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds timeout for AI operations
  private readonly CACHE_TTL = 300000; // 5 minutes cache retention
  private cache = new Map<string, any>();

  /**
   * Analyzes product with AI capabilities, includes caching and fallback mechanisms
   * @param data - Product data including description and images
   * @returns AI analysis results with confidence scores
   */
  async analyzeProduct(data: {
    description?: string;
    images?: string[];
    language?: string;
    region?: string;
  }) {
    const cacheKey = this.generateCacheKey('analyze', data);
    
    if (this.cache.has(cacheKey)) {
      logger.info('AI analysis: Cache hit');
      return this.cache.get(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

      const response = await axios.post(
        `${config.AI_SERVICE_URL}/analyze`,
        {
          ...data,
          metadata: {
            language: data.language || 'en',
            region: data.region || 'global',
            timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY,
            'X-App-Version': '2.1.0',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);
      
      // Store in cache with TTL
      this.cache.set(cacheKey, response.data);
      setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);
      
      logger.info('AI analysis: Successful with global parameters');
      return response.data;
    } catch (error) {
      logger.error('Primary AI analysis failed:', error);
      
      // Handle timeout specifically
      if (error.name === 'AbortError') {
        logger.warn('AI analysis timed out, switching to fallback system');
        return this.fallbackProductAnalysis(data);
      }
      
      // Fallback for all other errors
      return this.fallbackProductAnalysis(data);
    }
  }

  /**
   * Generates price recommendations with market intelligence
   * @param productData - Complete product information
   * @returns Price recommendation with confidence metrics
   */
  async getPriceRecommendation(productData: any) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);
      
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/price-recommendation`,
        {
          ...productData,
          global_market_data: true,
          currency: 'PI'
        },
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY,
            'X-Region': productData.region || 'global'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      logger.error('Price recommendation failed:', error);
      return this.fallbackPriceRecommendation(productData);
    }
  }

  /**
   * Detects fraudulent activity with global pattern recognition
   * @param orderData - Order information for fraud analysis
   * @returns Risk assessment with detailed metrics
   */
  async detectFraud(orderData: any) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/fraud-detection`,
        {
          ...orderData,
          global_context: true
        },
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Fraud detection failed:', error);
      return { 
        riskLevel: 'medium', 
        confidence: 0.65,
        reason: 'Fallback analysis activated'
      };
    }
  }

  /**
   * Analyzes disputes with cultural context awareness
   * @param data - Dispute details
   * @returns Analysis with resolution recommendations
   */
  async analyzeDispute(data: any) {
    try {
      const response = await axios.post(
        `${config.AI_SERVICE_URL}/dispute-analysis`,
        {
          ...data,
          cultural_context: true
        },
        {
          headers: {
            'X-API-Key': config.AI_SERVICE_KEY
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Dispute analysis failed:', error);
      return {
        resolution_confidence: 0.7,
        recommended_action: 'human_review',
        estimated_resolution_time: '24-48 hours'
      };
    }
  }

  /**
   * Fallback analysis when primary AI service is unavailable
   * @param data - Product data
   * @returns Basic analysis with reduced confidence
   */
  private fallbackProductAnalysis(data: { description?: string; images?: string[] }) {
    // Basic keyword analysis for fallback scenario
    const keywords = (data.description || '').toLowerCase().split(' ');
    const electronicsKeywords = ['phone', 'laptop', 'camera', 'tablet', 'computer'];
    const fashionKeywords = ['shirt', 'dress', 'shoes', 'clothes', 'fashion'];
    
    let detectedCategory = 'general';
    let confidenceScore = 0.6;
    
    if (keywords.some(k => electronicsKeywords.includes(k))) {
      detectedCategory = 'electronics';
      confidenceScore = 0.75;
    } else if (keywords.some(k => fashionKeywords.includes(k))) {
      detectedCategory = 'fashion';
      confidenceScore = 0.7;
    }
    
    // Basic price estimation based on image count and description length
    const basePrice = 0.01;
    const imageFactor = (data.images?.length || 1) * 0.001;
    const descriptionFactor = (data.description?.length || 0) * 0.00001;
    
    return {
      confidence_score: confidenceScore,
      detected_category: detectedCategory,
      quality_score: Math.min(9.0, 7.0 + (data.images?.length || 0) * 0.5),
      recommended_price_range: {
        min: Math.max(0.005, basePrice - (basePrice * 0.3)),
        max: basePrice + imageFactor + descriptionFactor
      },
      summary: 'Basic analysis (Fallback mode). Advanced AI analysis will be available shortly.',
      processing_time: '2-5 minutes'
    };
  }

  /**
   * Fallback price recommendation
   * @param productData - Product information
   * @returns Basic price recommendation
   */
  private fallbackPriceRecommendation(productData: any) {
    const basePrice = 0.01; // Default base price in Pi
    
    // Adjust based on category
    const categoryMultipliers: Record<string, number> = {
      electronics: 2.5,
      fashion: 1.2,
      home: 0.8,
      luxury: 5.0
    };
    
    const multiplier = categoryMultipliers[productData.category?.toLowerCase()] || 1.0;
    
    return {
      recommended_price: basePrice * multiplier,
      price_range: {
        min: basePrice * multiplier * 0.8,
        max: basePrice * multiplier * 1.2
      },
      confidence: 0.65,
      analysis_type: 'fallback'
    };
  }

  /**
   * Generates a unique cache key for AI operations
   * @param operation - Operation type
   * @param data - Request data
   * @returns Unique cache key string
   */
  private generateCacheKey(operation: string, data: any): string {
    const hashData = JSON.stringify({
      operation,
      description: data.description?.slice(0, 50),
      imageCount: data.images?.length,
      language: data.language,
      region: data.region
    });
    return crypto.createHash('md5').update(hashData).digest('hex');
  }
}
