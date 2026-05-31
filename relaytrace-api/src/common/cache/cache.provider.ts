import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';

/**
 * Provides a dedicated ioredis client for application-level caching.
 * Intentionally separate from the BullMQ connection pool so queue and
 * cache concerns remain independent.
 */
export const redisCacheProvider: FactoryProvider<Redis> = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Redis => {
    const logger = new Logger('RedisCacheProvider');

    // Azure Cache for Redis is TLS-only (port 6380). Enable via REDIS_TLS=true.
    const useTls = config.get<string>('REDIS_TLS') === 'true';

    const client = new Redis({
      host:          config.get<string>('REDIS_HOST', 'localhost'),
      port:          config.get<number>('REDIS_PORT', 6379),
      password:      config.get<string>('REDIS_PASSWORD') || undefined,
      ...(useTls ? { tls: {} } : {}),
      lazyConnect:   true,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    client.on('connect', () => logger.log('Redis cache client connected'));
    client.on('error',   (err: Error) => logger.error(`Redis cache error: ${err.message}`));

    return client;
  },
};
