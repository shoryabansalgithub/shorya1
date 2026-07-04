import { Module } from '@nestjs/common';
import { ValidationPipeline } from './validation-pipeline';
import { QualityScoreEngine } from './quality-score.engine';
import { DuplicateDetectionEngine } from './duplicate-detection.engine';
import { ValidationRuleEngine } from './validation-rule.engine';
import { ValidationWorker } from './validation.worker';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductValidationService } from './product-validation.service';
import { ProductValidationController } from './product-validation.controller';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'product-validation',
    }),
  ],
  controllers: [ProductValidationController],
  providers: [
    ProductValidationService,
    ValidationPipeline,
    QualityScoreEngine,
    DuplicateDetectionEngine,
    ValidationRuleEngine,
    ValidationWorker,
  ],
  exports: [ProductValidationService, ValidationPipeline, QualityScoreEngine, DuplicateDetectionEngine, ValidationRuleEngine],
})
export class ProductValidationModule {}
