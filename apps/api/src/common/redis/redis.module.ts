import { Global, Module, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfig } from '../../config/domains/redis.config';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (redisConfig: RedisConfig) => {
        const url = redisConfig.redisUrl;
        if (!url) {
          const logger = new Logger('RedisModule');
          logger.warn('REDIS_URL not configured. Some systems relying on Redis may fail or fallback.');
          // Return a placeholder or try to connect to localhost depending on standard practices.
          // Since existing code expects a client (or handles errors), we instantiate anyway, or a mock.
          return new Redis({ maxRetriesPerRequest: null, lazyConnect: true });
        }
        return new Redis(url, { maxRetriesPerRequest: null });
      },
      inject: [RedisConfig],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
