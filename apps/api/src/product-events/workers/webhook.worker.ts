import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { WebhookDispatcherService } from '../services/webhook-dispatcher.service';

@Processor('webhook-delivery')
@Injectable()
export class WebhookDeliveryWorker extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryWorker.name);

  constructor(
    private readonly webhookDispatcher: WebhookDispatcherService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing webhook delivery job ${job.id}`);
    
    if (job.name === 'deliver-webhook') {
      await this.webhookDispatcher.dispatch(
        job.data.endpointId, 
        job.data.eventId, 
        job.data.payload
      );
    }
  }
}
