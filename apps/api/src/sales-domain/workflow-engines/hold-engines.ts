import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalesOrderDto } from '../dto/create-sales-order.dto';
import { SalesFeatureConfig } from '../../config/domains/features/sales-feature.config';

@Injectable()
export class FraudHoldEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesConfig: SalesFeatureConfig
  ) {}

  /**
   * Evaluates order for suspicious activity.
   */
  async evaluate(shopId: string, orderId: string, dto: CreateSalesOrderDto, totalAmount: number): Promise<boolean> {
    // Simple mock logic: Hold if amount > threshold
    if (totalAmount > this.salesConfig.creditHoldThreshold) {
      await this.prisma.orderHold.create({
        data: {
          shopId,
          orderId,
          holdType: 'FRAUD',
          reason: `Order amount exceeds $${this.salesConfig.creditHoldThreshold} automated threshold`
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
