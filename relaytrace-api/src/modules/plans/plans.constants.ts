/** Redis cache key for the full active plan list (public endpoint). */
export const PLANS_LIST_CACHE_KEY = 'plans:list:active';

/** Redis cache key factory for a single plan by slug. */
export const planSlugCacheKey = (slug: string) => `plans:slug:${slug}`;

/** TTL for plan cache entries — 5 minutes. Plans change rarely. */
export const PLANS_CACHE_TTL_MS = 5 * 60 * 1_000;

/** Wildcard pattern for invalidating all plan-related cache keys. */
export const PLANS_CACHE_PATTERN = 'plans:*';
