import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReverseFinancialEngine {
  private readonly logger = new Logger(ReverseFinancialEngine.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a Credit Note reversing GST liabilities for the returned invoice.
   */
  async generateCreditNote(shopId: string, invoiceId: string, returnOrderId: string): Promise<void> {
    const invoice = await this.prisma.enterpriseInvoice.findUnique({
      where: { id: invoiceId, shopId }
    });

    if (!invoice) return;

    this.logger.log(`Generating Credit Note against Invoice ${invoice.invoiceNumber}`);

    // Create the physical CreditNote record
    await this.prisma.creditNote.create({
      data: {
        shopId,
        invoiceId,
        noteNumber: `CN-${invoice.invoiceNumber}-${Date.now()}`,
        amount: 0, // Simplified for brevity; would calculate based on ReturnLines
        reason: 'Sales Return',
        status: 'ISSUED'
      }
    });

    await this.prisma.returnTimeline.create({
      data: {
        returnOrderId,
        shopId,
        status: 'CREDIT_NOTE_GENERATED',
        notes: `Credit Note issued for tax reversal.`
      }
    });
  }
}
