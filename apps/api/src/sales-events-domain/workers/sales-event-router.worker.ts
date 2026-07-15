import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { SalesRedisBroadcaster } from '../services/sales-redis-broadcaster.service';
import { BullConfig } from '../../config/domains/bull.config';

@Injectable()
@Processor('sales-events')
export class SalesEventRouterWorker extends WorkerHost {
  private readonly logger = new Logger(SalesEventRouterWorker.name);

  constructor(
    private readonly redisBroadcaster: SalesRedisBroadcaster,
    @InjectQueue('sales-webhooks') private readonly webhooksQueue: Queue,
    @InjectQueue('sales-analytics') private readonly analyticsQueue: Queue,
    @InjectQueue('sales-notifications') private readonly notificationsQueue: Queue,
    private readonly bullConfig: BullConfig,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { shopId, type, payload, eventId } = job.data;
    this.logger.log(`Routing Event: ${type} [${eventId}] for Shop ${shopId}`);

    // 1. Real-time broadcast (Pub/Sub)
    await this.redisBroadcaster.broadcast(shopId, type, payload);

    // 2. Route to Webhooks
    await this.webhooksQueue.add(type, job.data, {
      jobId: `webhook-${eventId}`, // Idempotent
      attempts: this.bullConfig.defaultAttempts,
      backoff: { type: (this.bullConfig.backoffType || 'exponential') as 'exponential' | 'fixed', delay: this.bullConfig.backoffDelay }
    });

    // 3. Route to Analytics
    await this.analyticsQueue.add(type, job.data, {
      jobId: `analytics-${eventId}`,
      attempts: this.bullConfig.defaultAttempts
    });

    // 4. Route to Notifications (e.g., Send Email/SMS)
    await this.notificationsQueue.add(type, job.data, {
      jobId: `notify-${eventId}`,
      attempts: this.bullConfig.defaultAttempts
    });

    return { status: 'Routed' };
  }
}
