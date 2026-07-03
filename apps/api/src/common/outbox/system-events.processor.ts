import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { TenantContextService } from '../../iam/tenant-context/tenant-context.service';
import { TenantContext } from '../../iam/tenant-context/tenant-context.interface';
import * as crypto from 'crypto';

@Processor('system-events')
export class SystemEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemEventsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const eventId = job.opts.jobId;
    if (!eventId) {
      throw new UnrecoverableError('Job missing jobId (OutboxEvent.id) for idempotency tracking.');
    }

    const correlationId = job.data?.correlationId || 'legacy-event';
    const context: TenantContext = {
      correlationId,
      requestId: crypto.randomUUID(),
      shopId: job.data?.shopId,
      userId: job.data?.userId,
    };

    return new Promise((resolve, reject) => {
      TenantContextService.asAsyncLocalStorage.run(context, async () => {
        this.logger.debug(`Processing job ${job.name} (Event ID: ${eventId})`);

        try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Database-Level Idempotency Check
        const alreadyProcessed = await tx.auditLog.findFirst({
          where: {
            entity: 'OutboxEvent',
            entityId: eventId,
            action: 'SYSTEM_EVENT_PROCESSED'
          }
        });

        if (alreadyProcessed) {
          this.logger.warn(`Idempotency hit: Event ${eventId} was already successfully handled. Skipping.`);
          return;
        }

        // 2. Dispatch domain logic
        const payload = job.data?.payload || job.data;
        switch (job.name) {
          case 'INVOICE_CREATED':
            await this.handleInvoiceCreated(tx, payload);
            break;
          case 'BILL_SCANNED':
            await this.handleBillScanned(tx, payload);
            break;
          default:
            this.logger.warn(`Unknown job name: ${job.name}. Marking as processed to ignore.`);
            break;
        }

        // 3. Commit Idempotency Record
        await tx.auditLog.create({
          data: {
            shopId: job.data?.shopId || null,
            userId: job.data?.userId || 'SYSTEM',
            action: 'SYSTEM_EVENT_PROCESSED',
            entity: 'OutboxEvent',
            entityId: eventId,
            afterData: payload || {},
          }
        });
      });

      this.logger.log(`Successfully processed event ${eventId}`);
      resolve(true);
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`);
      
      if (this.isTransientError(error)) {
        reject(error);
      } else {
        reject(new UnrecoverableError(`Permanent failure: ${error.message}`));
      }
    }
      });
    });
  }

  private isTransientError(error: any): boolean {
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('deadlock') || msg.includes('timeout') || msg.includes('connection')) {
      return true;
    }
    if (error.code && ['P1001', 'P1002', 'P1008', 'P1011'].includes(error.code)) {
      return true;
    }
    return false;
  }

  // Domain handlers using transaction client
  private async handleInvoiceCreated(tx: Prisma.TransactionClient, data: any) {
    if (!data.invoiceId || !data.shopId) {
      throw new UnrecoverableError('Invalid payload for INVOICE_CREATED');
    }

    // Ledger entries are already created atomically inside the BillingService transaction.
    // This worker handles secondary side-effects only (notifications, analytics, etc).
    // Do NOT create duplicate ledger entries here.
    this.logger.log(`Invoice ${data.invoiceId} event acknowledged. Ledger entries were created atomically in the billing transaction.`);
    
    // Future: Send notifications, update analytics, trigger reports, etc.
  }

  private async handleBillScanned(tx: Prisma.TransactionClient, data: any) {
    if (!data.billId || !data.fileUrl) {
      throw new UnrecoverableError('Invalid payload for BILL_SCANNED');
    }

    this.logger.log(`Dispatching OCR job for bill ${data.billId} with url ${data.fileUrl}`);
  }
}
