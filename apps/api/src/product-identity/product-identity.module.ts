import { Module } from '@nestjs/common';
import { ProductIdentityService } from './product-identity.service';
import { ProductIdentityController } from './product-identity.controller';
import { Gs1EngineService } from './gs1-engine.service';
import { BarcodeGeneratorService } from './barcode-generator.service';
import { IdentityAuditService } from './identity-audit.service';
import { PrintingEngineService } from './printing-engine.service';
import { BulkBarcodeProcessor } from './bulk-barcode.processor';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'barcode-bulk',
    }),
  ],
  controllers: [ProductIdentityController],
  providers: [
    ProductIdentityService,
    Gs1EngineService,
    BarcodeGeneratorService,
    IdentityAuditService,
    PrintingEngineService,
    BulkBarcodeProcessor,
  ],
  exports: [ProductIdentityService],
})
export class ProductIdentityModule {}
