import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class IndexingEngineService {
  private readonly logger = new Logger(IndexingEngineService.name);

  constructor(
    @InjectQueue('search-indexing') private readonly indexingQueue: Queue
  ) {}

  /**
   * Dispatches a job to rebuild the entire search index for a tenant.
   */
  async triggerFullReindex(shopId: string) {
    this.logger.log(`Dispatching full reindex for shop ${shopId}`);
    await this.indexingQueue.add('full-reindex', { shopId });
  }

  /**
   * Event listener facade: In a real architecture this listens to Outbox 
   * 'ProductUpdated' / 'ProductCreated' events and queues incremental updates.
   */
  async triggerIncrementalIndex(shopId: string, entityId: string, entityType: string) {
    this.logger.log(`Dispatching incremental index for ${entityType} ${entityId}`);
    await this.indexingQueue.add('incremental-index', { shopId, entityId, entityType });
  }
}
