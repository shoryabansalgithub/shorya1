import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CorrelationContextService } from '../correlation/correlation-context.service';

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

    return new Promise((resolve, reject) => {
      CorrelationContextService.asAsyncLocalStorage.run(correlationId, async () => {
        this.logger.debug(`Processing job ${job.name} (Event ID: ${eventId})`);

        try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Database-Level Idempotency Check
        // We use the existing AuditLog to track processed events to guarantee zero duplicate financial side-effects.
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
        // (Using a system placeholder for userId since it's a background process)
        await tx.auditLog.create({
          data: {
            shopId: job.data?.shopId || 'SYSTEM',
            userId: 'SYSTEM_WORKER',
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
      
      // Retry Classification
      if (this.isTransientError(error)) {
        reject(error); // Standard throw triggers BullMQ exponential backoff retry
      } else {
        // Wrap permanent/fatal errors in UnrecoverableError to move to failed state/DLQ instantly
        reject(new UnrecoverableError(`Permanent failure: ${error.message}`));
      }
    }
      });
    });
  }

  private isTransientError(error: any): boolean {
    // Recognize DB deadlocks, timeouts, or explicit transient markers
    const msg = error.message?.toLowerCase() || '';
    if (msg.includes('deadlock') || msg.includes('timeout') || msg.includes('connection')) {
      return true;
    }
    // Prisma specific connection errors
    if (error.code && ['P1001', 'P1002', 'P1008', 'P1011'].includes(error.code)) {
      return true;
    }
    // Application logic errors (like invalid payload) are permanent
    return false;
  }

  // Domain handlers using transaction client
  private async handleInvoiceCreated(tx: Prisma.TransactionClient, data: any) {
    if (!data.invoiceId || !data.shopId || !data.amount) {
      throw new UnrecoverableError('Invalid payload for INVOICE_CREATED');
    }

    // Secondary Domain Idempotency
    const existingLedger = await tx.ledgerTransaction.findFirst({
      where: { invoiceId: data.invoiceId }
    });
    
    if (existingLedger) {
      this.logger.warn(`Ledger record already exists for invoice ${data.invoiceId}`);
      return; // Already recorded
    }

    // Enforce exactly-once Ledger write
    await tx.ledgerTransaction.create({
      data: {
        shopId: data.shopId,
        invoiceId: data.invoiceId,
        type: data.type || 'CREDIT',
        amount: data.amount,
        balanceAfter: data.balanceAfter || 0,
        description: data.description || 'Invoice creation'
      }
    });
  }

  private async handleBillScanned(tx: Prisma.TransactionClient, data: any) {
    if (!data.billId || !data.fileUrl) {
      throw new UnrecoverableError('Invalid payload for BILL_SCANNED');
    }

    // Example OCR logic placeholder. Wait, we are not fully implementing OCR here,
    // just the consumer safely handling the payload and dispatching to a hypothetical OCR service.
    // The strict requirement is safety, idempotency, and retry behavior.
    this.logger.log(`Dispatching OCR job for bill ${data.billId} with url ${data.fileUrl}`);
    
    // Simulate some logic
    // await this.ocrService.process(data.fileUrl);
  }
}
