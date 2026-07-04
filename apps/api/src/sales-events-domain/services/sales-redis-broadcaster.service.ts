import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SalesRedisBroadcaster {
  private readonly logger = new Logger(SalesRedisBroadcaster.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Broadcasts the verified event over Redis Pub/Sub for real-time consumers (e.g., Dashboards)
   */
  async broadcast(shopId: string, eventType: string, payload: any): Promise<void> {
    const channel = `shop:${shopId}:events:sales`;
    const message = JSON.stringify({ eventType, timestamp: new Date().toISOString(), payload });

    try {
      await this.redis.publish(channel, message);
      this.logger.debug(`Broadcasted ${eventType} on ${channel}`);
    } catch (error: any) {
      this.logger.error(`Failed to broadcast event to Redis: ${error.message}`);
      // Do not throw; Pub/Sub failures should not halt the event pipeline
    }
  }
}
