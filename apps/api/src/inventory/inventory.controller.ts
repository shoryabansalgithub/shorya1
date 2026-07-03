import { Controller, Get, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async getProducts() {
    return this.inventoryService.getProducts();
  }
}
