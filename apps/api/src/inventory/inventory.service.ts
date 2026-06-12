import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(shopId: string) {
    return this.prisma.product.findMany({
      where: { shopId, isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
