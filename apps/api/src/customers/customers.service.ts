import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    try {
      this.logger.log(`Attempting to create customer: ${JSON.stringify(data)}`);
      
      const newCustomer = await this.prisma.customer.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          address: data.address || null,
          creditLimit: data.creditLimit ? Number(data.creditLimit) : 5000,
          outstandingBalance: data.udharAmount ? Number(data.udharAmount) : 0,
          shopId: data.shopId || 'default-shop-id', // Temporary fallback
        },
      });

      this.logger.log(`Successfully committed INSERT query to customer table! New ID: ${newCustomer.id}`);
      return newCustomer;
    } catch (error) {
      this.logger.error(`Error occurred while inserting into customer table: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
