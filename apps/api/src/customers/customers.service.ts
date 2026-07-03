import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { TenantContextService } from '../iam/tenant-context/tenant-context.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService
  ) {}

  async create(data: { name: string; phone: string; email?: string; address?: string }) {
    try {
      this.logger.log(`Attempting to create customer: ${data.name}`);
      
      const newCustomer = await this.prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          shopId: undefined as any,
          email: data.email || null,
          address: data.address || null,
          creditLimit: 5000, // strict server default
          outstandingBalance: 0, // strict server default
        },
      });

      return newCustomer;
    } catch (error: any) {
      this.logger.error(`Error occurred while inserting into customer table: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    const shopId = this.tenantContext.getShopId();
    return this.prisma.customer.findMany({
      where: { shopId, isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
  }
}
