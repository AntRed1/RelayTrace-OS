import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT, DEFAULT_CACHE_TTL_MS } from './cache.constants';

/**
 * Generic, type-safe Redis cache service (cache-aside pattern).
 *
 * All values are JSON-serialized on write and deserialized on read.
 * TTL is expressed in milliseconds for precision.
 *
 * Usage:
 *   const plans = await this.cache.getOrSet('plans:all', fetchPlans, 300_000);
 *   await this.cache.del('plans:all');
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // ─── Primitives ───────────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      this.logger.warn(`Cache GET failed for "${key}": ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlMs = DEFAULT_CACHE_TTL_MS): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'PX', ttlMs);
    } catch (err) {
      this.logger.warn(`Cache SET failed for "${key}": ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Cache DEL failed for "${key}": ${(err as Error).message}`);
    }
  }

  /** Deletes all keys matching a glob-style pattern (e.g. 'plans:*'). */
  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn(`Cache DEL pattern "${pattern}" failed: ${(err as Error).message}`);
    }
  }

  // ─── Cache-aside helper ───────────────────────────────────────────────────

  /**
   * Returns the cached value if present; otherwise calls `loader`, caches the
   * result, and returns it. Cache failures are non-fatal — the loader always
   * runs as a fallback.
   */
  async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    ttlMs = DEFAULT_CACHE_TTL_MS,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await loader();
    await this.set(key, value, ttlMs);
    return value;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
