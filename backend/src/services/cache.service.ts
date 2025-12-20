// ============================================
// 🚀 REDIS CACHE SERVICE
// PATH: backend/src/services/cache.service.ts
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
  
  // ============================================
  // GET with automatic JSON parsing
  // ============================================
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
  
  // ============================================
  // SET with automatic JSON stringification
  // ============================================
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
  
  // ============================================
  // DELETE single or multiple keys
  // ============================================
  async del(...keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.del(keys);
    } catch (error) {
      logger.error(`❌ Cache DEL error:`, error);
      return 0;
    }
  }
  
  // ============================================
  // DELETE by pattern (e.g., "user:*")
  // ============================================
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
  
  // ============================================
  // EXISTS check
  // ============================================
  async exists(...keys: string[]): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.exists(keys);
    } catch (error) {
      logger.error(`❌ Cache EXISTS error:`, error);
      return 0;
    }
  }
  
  // ============================================
  // EXPIRE set TTL on existing key
  // ============================================
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      return await this.client.expire(key, ttl);
    } catch (error) {
      logger.error(`❌ Cache EXPIRE error:`, error);
      return false;
    }
  }
  
  // ============================================
  // INCREMENT (for counters, rate limiting)
  // ============================================
  async incr(key: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`❌ Cache INCR error:`, error);
      return 0;
    }
  }
  
  // ============================================
  // DECREMENT
  // ============================================
  async decr(key: string): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`❌ Cache DECR error:`, error);
      return 0;
    }
  }
  
  // ============================================
  // HASH operations (for structured data)
  // ============================================
  async hSet(key: string, field: string, value: any): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await this.client.hSet(key, field, stringValue);
    } catch (error) {
      logger.error(`❌ Cache HSET error:`, error);
      return 0;
    }
  }
  
  async hGet<T = any>(key: string, field: string): Promise<T | null> {
    try {
      if (!this.isConnected) return null;
      const value = await this.client.hGet(key, field);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error(`❌ Cache HGET error:`, error);
      return null;
    }
  }
  
  async hGetAll<T = any>(key: string): Promise<Record<string, T>> {
    try {
      if (!this.isConnected) return {};
      const data = await this.client.hGetAll(key);
      
      const parsed: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value as T;
        }
      }
      
      return parsed;
    } catch (error) {
      logger.error(`❌ Cache HGETALL error:`, error);
      return {};
    }
  }
  
  // ============================================
  // LIST operations (for queues, recent items)
  // ============================================
  async lPush(key: string, ...values: any[]): Promise<number> {
    try {
      if (!this.isConnected) return 0;
      const stringValues = values.map(v => 
        typeof v === 'string' ? v : JSON.stringify(v)
      );
      return await this.client.lPush(key, stringValues);
    } catch (error) {
      logger.error(`❌ Cache LPUSH error:`, error);
      return 0;
    }
  }
  
  async lRange<T = any>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      if (!this.isConnected) return [];
      const values = await this.client.lRange(key, start, stop);
      
      return values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v as T;
        }
      });
    } catch (error) {
      logger.error(`❌ Cache LRANGE error:`, error);
      return [];
    }
  }
  
  // ============================================
  // CACHE WRAPPER - Get or Set
  // ============================================
  async getOrSet<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T | null> {
    try {
      // Try to get from cache
      const cached = await this.get<T>(key);
      if (cached !== null) {
        logger.debug(`✅ Cache HIT: ${key}`);
        return cached;
      }
      
      logger.debug(`❌ Cache MISS: ${key}`);
      
      // Fetch fresh data
      const fresh = await fetchFn();
      
      // Store in cache
      await this.set(key, fresh, ttl);
      
      return fresh;
    } catch (error) {
      logger.error(`❌ Cache getOrSet error for key "${key}":`, error);
      // Return fresh data even if caching fails
      try {
        return await fetchFn();
      } catch {
        return null;
      }
    }
  }
  
  // ============================================
  // FLUSH ALL (use with caution!)
  // ============================================
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

// ============================================
// Export singleton instance
// ============================================
export const cacheService = new CacheService();

// ============================================
// 📝 USAGE EXAMPLES
// ============================================

/*
// 1. Simple Get/Set
await cacheService.set('user:123', { name: 'Ahmed', email: 'ahmed@example.com' }, 3600);
const user = await cacheService.get('user:123');

// 2. getOrSet Pattern (most common)
const products = await cacheService.getOrSet(
  'products:hot-deals',
  async () => {
    return await prisma.product.findMany({ where: { hot: true } });
  },
  300 // 5 minutes
);

// 3. Delete Pattern
await cacheService.delPattern('user:*'); // Clear all user caches

// 4. Hash (for structured data)
await cacheService.hSet('user:123', 'name', 'Ahmed');
await cacheService.hSet('user:123', 'email', 'ahmed@example.com');
const userData = await cacheService.hGetAll('user:123');

// 5. List (for recent items)
await cacheService.lPush('recent:viewed', product.id);
const recentProducts = await cacheService.lRange('recent:viewed', 0, 9);
*/
