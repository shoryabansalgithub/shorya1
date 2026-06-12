import { Controller, Get, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async getProducts(@Request() req: any) {
    return this.inventoryService.getProducts(req.user.shopId);
  }
}
