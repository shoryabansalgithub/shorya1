import { Module } from '@nestjs/common';
import { ProductSearchService } from './product-search.service';
import { ProductSearchController } from './product-search.controller';
import { SearchEngineService } from './search-engine.service';
import { SynonymEngineService } from './synonym-engine.service';
import { SearchAnalyticsService } from './search-analytics.service';
import { IndexingEngineService } from './indexing-engine.service';
import { IndexingWorker } from './indexing.worker';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'search-indexing',
    }),
  ],
  controllers: [ProductSearchController],
  providers: [
    ProductSearchService,
    SearchEngineService,
    SynonymEngineService,
    SearchAnalyticsService,
    IndexingEngineService,
    IndexingWorker,
  ],
  exports: [SearchEngineService],
})
export class ProductSearchModule {}
