"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("redis");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class CacheService {
    client;
    isConnected = false;
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: env_1.config.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.logger.error('❌ Redis: Too many retries, stopping');
                        return new Error('Too many retries');
                    }
                    return Math.min(retries * 50, 500);
                }
            }
        });
        this.client.on('error', (err) => {
            logger_1.logger.error('❌ Redis Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            logger_1.logger.info('🔄 Redis: Connecting...');
        });
        this.client.on('ready', () => {
            logger_1.logger.info('✅ Redis: Connected and ready');
            this.isConnected = true;
        });
        this.client.on('end', () => {
            logger_1.logger.warn('⚠️ Redis: Connection closed');
            this.isConnected = false;
        });
    }
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
    async get(key) {
        try {
            if (!this.isConnected)
                return null;
            const value = await this.client.get(key);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache GET error for key "${key}":`, error);
            return null;
        }
    }
    async set(key, value, ttl = 3600) {
        try {
            if (!this.isConnected)
                return false;
            const stringValue = typeof value === 'string'
                ? value
                : JSON.stringify(value);
            await this.client.setEx(key, ttl, stringValue);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache SET error for key "${key}":`, error);
            return false;
        }
    }
    async del(...keys) {
        try {
            if (!this.isConnected)
                return 0;
            return await this.client.del(keys);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache DEL error:`, error);
            return 0;
        }
    }
    async delPattern(pattern) {
        try {
            if (!this.isConnected)
                return 0;
            const keys = await this.client.keys(pattern);
            if (keys.length === 0)
                return 0;
            return await this.client.del(keys);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache DEL pattern error:`, error);
            return 0;
        }
    }
    async exists(...keys) {
        try {
            if (!this.isConnected)
                return 0;
            return await this.client.exists(keys);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache EXISTS error:`, error);
            return 0;
        }
    }
    async expire(key, ttl) {
        try {
            if (!this.isConnected)
                return false;
            return await this.client.expire(key, ttl);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache EXPIRE error:`, error);
            return false;
        }
    }
    async incr(key) {
        try {
            if (!this.isConnected)
                return 0;
            return await this.client.incr(key);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache INCR error:`, error);
            return 0;
        }
    }
    async decr(key) {
        try {
            if (!this.isConnected)
                return 0;
            return await this.client.decr(key);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache DECR error:`, error);
            return 0;
        }
    }
    async hSet(key, field, value) {
        try {
            if (!this.isConnected)
                return 0;
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            return await this.client.hSet(key, field, stringValue);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache HSET error:`, error);
            return 0;
        }
    }
    async hGet(key, field) {
        try {
            if (!this.isConnected)
                return null;
            const value = await this.client.hGet(key, field);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache HGET error:`, error);
            return null;
        }
    }
    async hGetAll(key) {
        try {
            if (!this.isConnected)
                return {};
            const data = await this.client.hGetAll(key);
            const parsed = {};
            for (const [field, value] of Object.entries(data)) {
                try {
                    parsed[field] = JSON.parse(value);
                }
                catch {
                    parsed[field] = value;
                }
            }
            return parsed;
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache HGETALL error:`, error);
            return {};
        }
    }
    async lPush(key, ...values) {
        try {
            if (!this.isConnected)
                return 0;
            const stringValues = values.map(v => typeof v === 'string' ? v : JSON.stringify(v));
            return await this.client.lPush(key, stringValues);
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache LPUSH error:`, error);
            return 0;
        }
    }
    async lRange(key, start, stop) {
        try {
            if (!this.isConnected)
                return [];
            const values = await this.client.lRange(key, start, stop);
            return values.map(v => {
                try {
                    return JSON.parse(v);
                }
                catch {
                    return v;
                }
            });
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache LRANGE error:`, error);
            return [];
        }
    }
    async getOrSet(key, fetchFn, ttl = 3600) {
        try {
            const cached = await this.get(key);
            if (cached !== null) {
                logger_1.logger.debug(`✅ Cache HIT: ${key}`);
                return cached;
            }
            logger_1.logger.debug(`❌ Cache MISS: ${key}`);
            const fresh = await fetchFn();
            await this.set(key, fresh, ttl);
            return fresh;
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache getOrSet error for key "${key}":`, error);
            try {
                return await fetchFn();
            }
            catch {
                return null;
            }
        }
    }
    async flushAll() {
        try {
            if (!this.isConnected)
                return;
            await this.client.flushAll();
            logger_1.logger.warn('⚠️ Redis: FLUSHED ALL DATA');
        }
        catch (error) {
            logger_1.logger.error(`❌ Cache FLUSH error:`, error);
        }
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.service.js.map