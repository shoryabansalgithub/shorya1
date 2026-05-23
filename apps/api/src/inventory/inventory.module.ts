import { Module } from '@nestjs/common';
import { InventoryGateway } from './inventory.gateway';
import { InventoryCacheService } from './inventory-cache.service';

@Module({
  providers: [InventoryGateway, InventoryCacheService],
  exports: [InventoryGateway, InventoryCacheService],
})
export class InventoryModule {}
