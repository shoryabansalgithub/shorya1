import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdempotencyEngine {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checks if a transaction with the given idempotency key already exists.
   * If it does, and it's successful, returns true so the caller can return the cached response.
   */
  async ensureIdempotency(shopId: string, idempotencyKey: string): Promise<boolean> {
    const existingTx = await this.prisma.paymentTransaction.findUnique({
      where: {
        shopId_idempotencyKey: {
          shopId,
          idempotencyKey
        }
      }
    });

    if (existingTx) {
      if (['CAPTURED', 'AUTHORIZED', 'PENDING'].includes(existingTx.status)) {
        return true; // Already processed
      }
      if (existingTx.status === 'FAILED') {
        throw new BadRequestException('Previous attempt failed. Please generate a new idempotency key to retry.');
      }
    }
    
    return false; // Safe to proceed
  }
}
