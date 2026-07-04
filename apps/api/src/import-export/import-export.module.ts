import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductValidationModule } from '../product-validation/product-validation.module';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { FileStorageService } from './file-storage.service';
import { ParsingEngineService } from './parsing-engine.service';
import { ImportExecutionService } from './import-execution.service';
import { ImportWorker } from './import.worker';

@Module({
  imports: [
    PrismaModule,
    ProductValidationModule,
    BullModule.registerQueue({
      name: 'import-job',
    }),
  ],
  controllers: [ImportExportController],
  providers: [
    ImportExportService,
    FileStorageService,
    ParsingEngineService,
    ImportExecutionService,
    ImportWorker,
  ],
  exports: [ImportExecutionService],
})
export class ImportExportModule {}
