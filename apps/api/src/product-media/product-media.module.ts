import { Module } from '@nestjs/common';
import { ProductMediaService } from './product-media.service';
import { ProductMediaController } from './product-media.controller';
import { UploadEngineService } from './upload-engine.service';
import { DeduplicationService } from './deduplication.service';
import { CdnManagerService } from './cdn-manager.service';
import { CompressionEngineService } from './compression-engine.service';
import { MediaProcessorWorker } from './media-processor.worker';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'media-processing',
    }),
  ],
  controllers: [ProductMediaController],
  providers: [
    ProductMediaService,
    UploadEngineService,
    DeduplicationService,
    CdnManagerService,
    CompressionEngineService,
    MediaProcessorWorker,
  ],
  exports: [ProductMediaService],
})
export class ProductMediaModule {}
