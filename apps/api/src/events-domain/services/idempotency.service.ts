import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Checks if an event has already been processed by a specific consumer.
   * Uses Prisma unique constraint to prevent race conditions during insertion.
   * Returns true if it was inserted successfully (first time processing).
   * Returns false if it already exists (duplicate event/replay attack).
   */
  async recordProcessing(eventId: string, consumerId: string): Promise<boolean> {
    try {
      await this.prisma.idempotencyRecord.create({
        data: {
          eventId,
          consumerId,
          status: 'PROCESSED'
        }
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint failed -> duplicate
        this.logger.warn(`Idempotency check blocked duplicate event: ${eventId} for consumer: ${consumerId}`);
        return false;
      }
      throw error;
    }
  }
}
