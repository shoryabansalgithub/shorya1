import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingHelpers } from './billing.helpers';
import { BillingController } from './billing.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [BillingController],
  providers: [BillingService, BillingHelpers],
  exports: [BillingService],
})
export class BillingModule {}
