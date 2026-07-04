import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderNumberEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a transaction-safe, sequential Enterprise Order Number.
   * Format: [PREFIX]-[YYYYMM]-[SEQ] (e.g., SO-202607-000001)
   */
  async generateOrderNumber(shopId: string, prefix: string = 'SO'): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Upsert the sequence record atomically
    const sequence = await this.prisma.salesOrderSequence.upsert({
      where: {
        shopId_prefix_yearMonth: {
          shopId,
          prefix,
          yearMonth
        }
      },
      update: {
        currentValue: { increment: 1 }
      },
      create: {
        shopId,
        prefix,
        yearMonth,
        currentValue: 1
      }
    });

    const sequenceStr = String(sequence.currentValue).padStart(6, '0');
    return `${prefix}-${yearMonth}-${sequenceStr}`;
  }
}
