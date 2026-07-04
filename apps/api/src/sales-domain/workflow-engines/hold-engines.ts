import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';

@Injectable()
export class FraudHoldEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates order for suspicious activity.
   */
  async evaluate(shopId: string, orderId: string, dto: CreateSalesOrderDto, totalAmount: number): Promise<boolean> {
    // Simple mock logic: Hold if amount > $10,000
    if (totalAmount > 10000) {
      await this.prisma.orderHold.create({
        data: {
          shopId,
          orderId,
          holdType: 'FRAUD',
          reason: 'Order amount exceeds $10,000 automated threshold'
        }
      });
      return true;
    }
    return false;
  }
}

@Injectable()
export class CreditHoldEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if customer has exceeded credit limits.
   */
  async evaluate(shopId: string, orderId: string, customerId: string | null): Promise<boolean> {
    if (!customerId) return false;

    // Pseudo logic: Check customer balance from some other domain module
    const hasOutstandingCredit = false; 

    if (hasOutstandingCredit) {
      await this.prisma.orderHold.create({
        data: {
          shopId,
          orderId,
          holdType: 'CREDIT',
          reason: 'Customer has exceeded credit terms'
        }
      });
      return true;
    }
    return false;
  }
}
