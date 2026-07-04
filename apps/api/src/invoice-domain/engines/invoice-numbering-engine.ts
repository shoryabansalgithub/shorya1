import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InvoiceNumberingEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a guaranteed gapless sequential number using pessimistic locking.
   */
  async generateNextNumber(shopId: string, entityType: string, prefix: string): Promise<string> {
    // We execute a raw query to lock the row. This prevents any other transaction 
    // from reading or updating this specific sequence until this transaction commits.
    return this.prisma.$transaction(async (tx) => {
      // 1. Ensure the sequence row exists (upsert without lock first)
      await tx.numberSequence.upsert({
        where: {
          shopId_entityType_prefix: {
            shopId,
            entityType,
            prefix
          }
        },
        update: {},
        create: {
          shopId,
          entityType,
          prefix,
          lastNumber: 0
        }
      });

      // 2. Select for Update (Pessimistic Lock)
      const sequence = await tx.$queryRaw<Array<{ id: string, lastNumber: number }>>`
        SELECT id, lastNumber 
        FROM NumberSequence 
        WHERE shopId = ${shopId} AND entityType = ${entityType} AND prefix = ${prefix}
        FOR UPDATE
      `;

      if (!sequence || sequence.length === 0) {
        throw new InternalServerErrorException('Failed to acquire sequence lock');
      }

      const nextNumber = sequence[0].lastNumber + 1;

      // 3. Update the sequence
      await tx.$executeRaw`
        UPDATE NumberSequence 
        SET lastNumber = ${nextNumber}, updatedAt = NOW(3)
        WHERE id = ${sequence[0].id}
      `;

      // 4. Return formatted string (e.g. INV/2026/000001)
      const formattedNumber = String(nextNumber).padStart(6, '0');
      return `${prefix}${formattedNumber}`;
    });
  }
}
