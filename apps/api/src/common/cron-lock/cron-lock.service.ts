import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class CronLockService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CronLockService.name);
  private redisClient: Redis;
  private redlock: Redlock;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured. Cron locks will fallback to local execution only.');
      return;
    }

    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
      });

      this.redlock = new Redlock([this.redisClient as any], {
        driftFactor: 0.01, // time in ms
        retryCount: 0, // we don't want to retry acquiring a cron lock; if we miss it, another pod got it.
        retryDelay: 200, // time in ms
        retryJitter: 200, // time in ms
      } as any);

      this.redlock.on('clientError', (error: any) => {
        // Ignore cases where a lock could not be acquired
        if (error.message && error.message.includes('attempts to lock the resource')) {
          return;
        }
        this.logger.error(`Redlock error: ${error.message}`);
      });
    } catch (err) {
      this.logger.error('Failed to initialize Redlock', err);
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  /**
   * Attempts to acquire a distributed lock. If successful, executes the callback.
   * If the lock is already held by another pod, returns null and does not execute the callback.
   * 
   * @param resource The string identifier for the lock (e.g., 'cron:purge-outbox')
   * @param ttlMs Time-to-live for the lock in milliseconds
   * @param callback Function to execute if lock is acquired
   */
  async withLock<T>(resource: string, ttlMs: number, callback: () => Promise<T>): Promise<T | null> {
    if (!this.redlock) {
      // Fallback for dev environments without Redis
      this.logger.warn(`Bypassing distributed lock for ${resource} (Redis not configured)`);
      return await callback();
    }

    try {
      const lock = await this.redlock.acquire([resource], ttlMs);
      this.logger.debug(`Lock acquired: ${resource}`);
      try {
        return await callback();
      } finally {
        await (lock as any).unlock().catch((e: any) => {
          this.logger.error(`Failed to release lock ${resource}: ${e.message}`);
        });
      }
    } catch {
      // ExecutionExecutionError means lock couldn't be acquired (another pod has it). This is expected.
      this.logger.debug(`Lock ${resource} is held by another pod. Skipping execution.`);
      return null;
    }
  }
}
