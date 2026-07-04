import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingCacheService } from '../services/pricing-cache.service';

@Injectable()
@Processor('pricing-scheduler-queue')
export class PricingSchedulerWorker extends WorkerHost {
  private readonly logger = new Logger(PricingSchedulerWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: PricingCacheService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing pricing job ${job.id} of type ${job.name}`);

    if (job.name === 'ACTIVATE_PROMOTION') {
      const { shopId, promotionId } = job.data;
      await this.prisma.promotion.update({
        where: { id: promotionId },
        data: { status: 'PUBLISHED' }
      });
      // Invalidate shop pricing caches since prices just changed globally
      await this.cache.invalidateShopPricing(shopId);
    }

    if (job.name === 'EXPIRE_PROMOTION') {
      const { shopId, promotionId } = job.data;
      await this.prisma.promotion.update({
        where: { id: promotionId },
        data: { status: 'EXPIRED' }
      });
      await this.cache.invalidateShopPricing(shopId);
    }
  }
}
