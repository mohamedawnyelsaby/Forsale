// ============================================
// 📄 FILENAME: cache.service.ts (FIXED)
// 📍 PATH: backend/src/services/cache.service.ts
// ============================================

import { createClient, RedisClientType } from 'redis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  
  constructor() {
    this.client = createClient({
      url: config.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('❌ Redis: Too many retries, stopping');
            return new Error('Too many retries');
          }
          return Math.min(retries * 50, 500);
        }
      }
    });
    
    this.client.on('error', (err) => {
      logger.error('❌ Redis Error:', err);
      this.isConnected = false;
    });
    
    this.client.on('connect', () => {
      logger.info('🔄 Redis: Connecting...');
    });
    
    this.client.on('ready', () => {
      logger.info('✅ Redis: Connected and ready');
      this.isConnected = true;
    });
    
    this.client.on('end', () => {
      logger.warn('⚠️ Redis: Connection closed');
      this.isConnected = false;
    });
  }
  
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) return null;
      
      const value = await this.client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`❌ Cache GET error for key "${key}":`, error);
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value);
      
      await this.client.setEx(key, ttl, stringValue);
      return true;
    } catch (error) {
      logger.error(`❌ Cache SET error for key "${key}":`, error);
      return false;
    }
  }
  
  async del(...keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.del(keys);
    } catch (error) {
      logger.error(`❌ Cache DEL error:`, error);
      return 0;
    }
  }
  
  async delPattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.client.del(keys);
    } catch (error) {
      logger.error(`❌ Cache DEL pattern error:`, error);
      return 0;
    }
  }
  
  async exists(...keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.exists(keys);
    } catch (error) {
      logger.error(`❌ Cache EXISTS error:`, error);
      return 0;
    }
  }
  
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      return await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`❌ Cache EXPIRE error:`, error);
      return false;
    }
  }
  
  async incr(key: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`❌ Cache INCR error:`, error);
      return 0;
    }
  }
  
  async decr(key: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`❌ Cache DECR error:`, error);
      return 0;
    }
  }
  
  async getOrSet<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T | null> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        logger.debug(`✅ Cache HIT: ${key}`);
        return cached;
      }
      
      logger.debug(`❌ Cache MISS: ${key}`);
      
      const fresh = await fetchFn();
      await this.set(key, fresh, ttl);
      
      return fresh;
    } catch (error) {
      logger.error(`❌ Cache getOrSet error for key "${key}":`, error);
      try {
        return await fetchFn();
      } catch {
        return null;
      }
    }
  }
  
  async flushAll(): Promise<void> {
    try {
      if (!this.isConnected) return;
      await this.client.flushAll();
      logger.warn('⚠️ Redis: FLUSHED ALL DATA');
    } catch (error) {
      logger.error(`❌ Cache FLUSH error:`, error);
    }
  }
}

export const cacheService = new CacheService();
