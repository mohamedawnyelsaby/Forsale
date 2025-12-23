export declare class CacheService {
    private client;
    private isConnected;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    del(...keys: string[]): Promise<number>;
    delPattern(pattern: string): Promise<number>;
    exists(...keys: string[]): Promise<number>;
    expire(key: string, ttl: number): Promise<boolean>;
    incr(key: string): Promise<number>;
    decr(key: string): Promise<number>;
    getOrSet<T = any>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T | null>;
    flushAll(): Promise<void>;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cache.service.d.ts.map