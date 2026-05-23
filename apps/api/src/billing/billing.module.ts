import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingHelpers } from './billing.helpers';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  providers: [BillingService, BillingHelpers],
  exports: [BillingService],
})
export class BillingModule {}
