import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { TenantContextService } from '../iam/tenant-context/tenant-context.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService
  ) {}

  async getProducts() {
    const shopId = this.tenantContext.getShopId();
    return this.prisma.product.findMany({
      where: { shopId, isDeleted: false, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
