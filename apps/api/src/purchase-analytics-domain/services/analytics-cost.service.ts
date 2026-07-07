import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsCostService {
  constructor(private readonly prisma: PrismaService) {}

  async getCostAnalysis(shopId: string) {
    const bills = await this.prisma.vendorBill.aggregate({
      where: { shopId, status: { notIn: ['DRAFT', 'CANCELLED'] } },
      _sum: {
        taxAmount: true,
        discountAmount: true
      }
    });

    return {
      taxCost: bills._sum.taxAmount?.toNumber() || 0,
      discountSavings: bills._sum.discountAmount?.toNumber() || 0
    };
  }
}
