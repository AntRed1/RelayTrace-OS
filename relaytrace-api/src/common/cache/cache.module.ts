import { Global, Module } from '@nestjs/common';
import { redisCacheProvider } from './cache.provider';
import { CacheService } from './cache.service';

/**
 * Global module — import once in AppModule.
 * Provides CacheService to every module in the application.
 */
@Global()
@Module({
  providers: [redisCacheProvider, CacheService],
  exports:   [CacheService],
})
export class CacheModule {}
