import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AnalyticsEventListener implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsEventListener.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectQueue('purchase-analytics') private readonly analyticsQueue: Queue
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Analytics Event Listeners...');
  }
  
  @OnEvent('PurchaseOrderApproved')
  async handlePurchaseOrderApproved(event: any) {
    await this.handleDocumentUpdate(event.shopId);
  }

  @OnEvent('GRNCompleted')
  async handleGRNCompleted(event: any) {
    await this.handleDocumentUpdate(event.shopId);
  }

  @OnEvent('VendorBillPosted')
  async handleVendorBillPosted(event: any) {
    await this.handleDocumentUpdate(event.shopId);
  }
  
  private async handleDocumentUpdate(shopId: string) {
    const today = new Date();
    const normalizedDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const cacheKey = `dashboard:${shopId}:${normalizedDate.toISOString()}`;
    
    // 1. Invalidate instantly so users get fresh fallback data
    await this.cacheManager.del(cacheKey);
    
    // 2. Queue heavy rebuilding operation in the background
    await this.analyticsQueue.add('aggregate-daily-dashboard', { shopId }, {
      removeOnComplete: true,
      attempts: 3
    });
    await this.analyticsQueue.add('aggregate-vendor-performance', { shopId }, {
      removeOnComplete: true,
      attempts: 3
    });
    await this.analyticsQueue.add('aggregate-category-spend', { shopId }, {
      removeOnComplete: true,
      attempts: 3
    });
    await this.analyticsQueue.add('aggregate-trends', { shopId }, {
      removeOnComplete: true,
      attempts: 3
    });
  }
}
