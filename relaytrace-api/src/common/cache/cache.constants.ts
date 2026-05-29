/** Injection token for the shared ioredis client used by CacheService. */
export const REDIS_CLIENT = 'REDIS_CLIENT' as const;

/** Default TTL for all cache entries — 5 minutes in milliseconds. */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1_000;
