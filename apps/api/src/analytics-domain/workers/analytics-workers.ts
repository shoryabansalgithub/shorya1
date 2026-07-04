import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsCacheService } from '../services/analytics-cache.service';

@Injectable()
@Processor('analytics-aggregation-queue')
export class AnalyticsAggregationWorker extends WorkerHost {
  private readonly logger = new Logger(AnalyticsAggregationWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AnalyticsCacheService
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    // Conceptually handles domain events via CQRS
    // Upserts the DailySalesAggregation table incrementally
    const { shopId, eventType, amount, tax, discount, date } = job.data;
    
    this.logger.log(`Aggregating event ${eventType} for shop ${shopId}`);

    const eventDate = new Date(date);
    eventDate.setUTCHours(0,0,0,0);

    // Simplistic representation of an atomic upsert
    // Production would use Prisma raw queries or findFirst+Update loops
    await this.prisma.dailySalesAggregation.upsert({
      where: { shopId_date: { shopId, date: eventDate } },
      create: {
        shopId,
        date: eventDate,
        grossRevenue: amount,
        netRevenue: amount - (discount || 0),
        totalTax: tax || 0,
        ordersCount: 1,
      },
      update: {
        grossRevenue: { increment: amount },
        netRevenue: { increment: amount - (discount || 0) },
        totalTax: { increment: tax || 0 },
        ordersCount: { increment: 1 }
      }
    });

    // Invalidate high-speed Redis caches so the next dashboard load sees the fresh data
    await this.cache.invalidateDashboard(shopId);
  }
}

@Injectable()
@Processor('analytics-export-queue')
export class AnalyticsExportWorker extends WorkerHost {
  private readonly logger = new Logger(AnalyticsExportWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobId, shopId, type } = job.data;
    this.logger.log(`Processing Analytics Export Job: ${jobId}`);

    // CSV/PDF logic goes here.
    // ...

    await this.prisma.analyticsExportJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        fileUrl: `https://s3-bucket/exports/${jobId}.${type.toLowerCase()}`,
        completedAt: new Date()
      }
    });
  }
}
