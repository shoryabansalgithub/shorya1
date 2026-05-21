import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InventoryGateway } from '../inventory/inventory.gateway';
import { InventoryCacheService } from '../inventory/inventory-cache.service';
import { BillingHelpers } from './billing.helpers';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';

interface RequestUser {
  userId: string;
  shopId: string;
  ipAddress?: string;
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryGateway: InventoryGateway,
    private readonly inventoryCache: InventoryCacheService,
    private readonly billingHelpers: BillingHelpers
  ) {}

  async createInvoice(dto: CreateInvoiceDto, user: RequestUser): Promise<any> {
    // Step A: Pre-validate ALL items BEFORE starting the transaction
    const productIds = dto.items.map(i => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, shopId: user.shopId, isDeleted: false, isActive: true },
      select: { id: true, name: true, currentStock: true, stockVersion: true, sellingPrice: true, costPrice: true, gstRate: true, hsnCode: true, unit: true }
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId)!;
      if (item.quantity <= 0) {
        throw new BadRequestException(`Quantity for ${product.name} must be greater than 0`);
      }
      if (product.currentStock.lessThan(item.quantity)) {
        throw new ConflictException({
          message: `Insufficient stock for "${product.name}"`,
          productId: product.id,
          productName: product.name,
          requestedQty: item.quantity,
          availableQty: product.currentStock.toNumber(),
          code: 'INSUFFICIENT_STOCK'
        });
      }
    }

    // Step A.5: Redis Atomic Pre-check (Layer 3)
    const decrementedInRedis = [];
    try {
      for (const item of dto.items) {
        const status = await this.inventoryCache.tryDecrementStock(user.shopId, item.productId, item.quantity);
        if (status === 'insufficient') {
          throw new ConflictException({
            message: `Insufficient stock for a product (fast rejection)`,
            productId: item.productId,
            code: 'INSUFFICIENT_STOCK'
          });
        }
        if (status === 'ok') {
          decrementedInRedis.push(item);
        }
      }
    } catch (e) {
      if (e instanceof ConflictException) {
        // Rollback whatever we successfully decremented in Redis
        for (const doneItem of decrementedInRedis) {
          await this.inventoryCache.restoreStock(user.shopId, doneItem.productId, doneItem.quantity);
        }
        throw e;
      }
    }

    // Step B: Idempotency check
    const existing = await this.prisma.invoice.findFirst({
      where: { idempotencyKey: dto.idempotencyKey, shopId: user.shopId },
      include: { items: true, customer: true }
    });
    if (existing) {
      // If we pre-decremented, rollback since we aren't executing the transaction
      for (const doneItem of decrementedInRedis) {
        await this.inventoryCache.restoreStock(user.shopId, doneItem.productId, doneItem.quantity);
      }
      return existing;
    }

    const MAX_RETRIES = 3;
    let attempt = 0;
    const stockDeductions: Array<{ productId: string; newStock: number; newVersion: number }> = [];

    while (attempt < MAX_RETRIES) {
      attempt++;
      try {
        const result = await this.prisma.$transaction(async (tx) => {
          // Clear array for each retry attempt
          stockDeductions.length = 0;

          // ━━━ CRITICAL SECTION START ━━━
          for (const item of dto.items) {
            const currentProduct = productMap.get(item.productId)!;

            const updateResult = await tx.$executeRaw`
              UPDATE Product
              SET
                currentStock = currentStock - ${item.quantity},
                stockVersion = stockVersion + 1,
                updatedAt = NOW()
              WHERE
                id = ${item.productId}
                AND shopId = ${user.shopId}
                AND currentStock >= ${item.quantity}
                AND stockVersion = ${currentProduct.stockVersion}
                AND isDeleted = false
            `;

            if (updateResult === 0) {
              const freshProduct = await tx.product.findUnique({
                where: { id: item.productId },
                select: { currentStock: true, stockVersion: true, name: true }
              });

              if (!freshProduct) {
                throw new NotFoundException(`Product ${item.productId} not found`);
              }

              if (freshProduct.currentStock.lessThan(item.quantity)) {
                throw new ConflictException({
                  message: `"${freshProduct.name}" is out of stock. Only ${freshProduct.currentStock} unit(s) available.`,
                  productId: item.productId,
                  productName: freshProduct.name,
                  requestedQty: item.quantity,
                  availableQty: freshProduct.currentStock.toNumber(),
                  code: 'INSUFFICIENT_STOCK'
                });
              }

              throw new Error('OPTIMISTIC_LOCK_CONFLICT');
            }

            stockDeductions.push({
              productId: item.productId,
              newStock: currentProduct.currentStock.toNumber() - item.quantity,
              newVersion: currentProduct.stockVersion + 1
            });
          }
          // ━━━ STOCK DEDUCTION COMPLETE ━━━

          // Step C: Generate invoice number
          const today = new Date();
          // Indian timezone formatted
          const dateStr = today.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3$1$2');
          const financialYear = today.getMonth() >= 3 ? `${today.getFullYear()}-${(today.getFullYear() + 1).toString().slice(2)}` : `${today.getFullYear() - 1}-${today.getFullYear().toString().slice(2)}`;

          const lastInvoice: any[] = await tx.$queryRaw`
            SELECT invoiceNumber FROM Invoice
            WHERE shopId = ${user.shopId}
              AND invoiceNumber LIKE ${`INV-${dateStr}-%`}
            ORDER BY invoiceNumber DESC
            LIMIT 1
            FOR UPDATE
          `;

          let sequence = 1;
          if (lastInvoice.length > 0) {
            const lastSeq = parseInt(lastInvoice[0].invoiceNumber.split('-')[2], 10);
            sequence = lastSeq + 1;
          }
          const invoiceNumber = `INV-${dateStr}-${String(sequence).padStart(5, '0')}`;

          // Step D: Calculate GST
          const shop = await tx.shop.findUnique({ where: { id: user.shopId }, select: { state: true } });
          const customer = dto.customerId
            ? await tx.customer.findUnique({ where: { id: dto.customerId }, select: { state: true, outstandingBalance: true, creditLimit: true } })
            : null;

          const isInterState = customer?.state ? shop!.state !== customer.state : false;

          let subtotal = new Decimal(0);
          let totalTax = new Decimal(0);
          let totalDiscount = new Decimal(0);

          const lineItems = dto.items.map(item => {
            const product = productMap.get(item.productId)!;
            const unitPrice = new Decimal(product.sellingPrice.toString());
            const qty = new Decimal(item.quantity);
            const discPct = new Decimal(item.discountPercent ?? 0);

            const lineSubtotal = unitPrice.mul(qty);
            const discountAmt = lineSubtotal.mul(discPct).div(100).toDecimalPlaces(2);
            const taxableAmt = lineSubtotal.minus(discountAmt);

            const gstRateMap: Record<string, number> = { ZERO: 0, FIVE: 5, TWELVE: 12, EIGHTEEN: 18, TWENTYEIGHT: 28 };
            const gstPct = new Decimal(gstRateMap[product.gstRate] ?? 18);

            let cgstAmt = new Decimal(0), sgstAmt = new Decimal(0), igstAmt = new Decimal(0);
            if (isInterState) {
              igstAmt = taxableAmt.mul(gstPct).div(100).toDecimalPlaces(2);
            } else {
              const halfGst = gstPct.div(2);
              cgstAmt = taxableAmt.mul(halfGst).div(100).toDecimalPlaces(2);
              sgstAmt = taxableAmt.mul(halfGst).div(100).toDecimalPlaces(2);
            }
            const taxAmt = cgstAmt.plus(sgstAmt).plus(igstAmt);
            const lineTotal = taxableAmt.plus(taxAmt);

            subtotal = subtotal.plus(lineSubtotal);
            totalTax = totalTax.plus(taxAmt);
            totalDiscount = totalDiscount.plus(discountAmt);

            return {
              productId: item.productId,
              productName: product.name,
              productSku: item.productId,
              quantity: qty.toNumber(),
              unit: product.unit,
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              mrp: product.sellingPrice,
              discountPercent: discPct.toNumber(),
              gstRate: product.gstRate,
              cgstAmount: cgstAmt,
              sgstAmount: sgstAmt,
              igstAmount: igstAmt,
              totalAmount: lineTotal,
            };
          });

          const taxableTotal = subtotal.minus(totalDiscount);
          const grandTotal = taxableTotal.plus(totalTax);
          const roundOff = new Decimal(Math.round(grandTotal.toNumber()) - grandTotal.toNumber()).toDecimalPlaces(2);
          const finalTotal = grandTotal.plus(roundOff);

          // Step F: Validate Udhar
          if (dto.paymentMode === 'UDHAR' || dto.paymentMode === 'SPLIT') {
            if (!dto.customerId) throw new BadRequestException('A customer must be selected for Udhar billing.');
            if (!customer) throw new NotFoundException('Customer not found.');

            const udharAmount = dto.paymentMode === 'UDHAR' ? finalTotal : new Decimal(dto.udharAmount ?? 0);
            const newBalance = new Decimal(customer.outstandingBalance.toString()).plus(udharAmount);

            if (newBalance.greaterThan(new Decimal(customer.creditLimit.toString())) && !dto.adminOverride) {
              throw new ConflictException({
                message: `Credit limit exceeded.`,
                code: 'CREDIT_LIMIT_EXCEEDED',
                creditLimit: customer.creditLimit,
                currentBalance: customer.outstandingBalance,
                requestedAmount: udharAmount,
                projectedBalance: newBalance
              });
            }
          }

          // Step G: Create Invoice
          const invoice = await tx.invoice.create({
            data: {
              invoiceNumber,
              financialYear,
              idempotencyKey: dto.idempotencyKey,
              shopId: user.shopId,
              customerId: dto.customerId ?? null,
              cashierId: user.userId,
              paymentMode: dto.paymentMode,
              status: 'COMPLETED',
              subtotal,
              discountAmount: totalDiscount,
              taxableAmount: taxableTotal,
              taxAmount: totalTax,
              roundOffAmount: roundOff,
              totalAmount: finalTotal,
              paidAmount: dto.paymentMode === 'UDHAR' ? new Decimal(0) : finalTotal,
              changeAmount: dto.cashTendered ? new Decimal(dto.cashTendered).minus(finalTotal).toDecimalPlaces(2) : new Decimal(0),
              udharAmount: dto.paymentMode === 'UDHAR' ? finalTotal : (dto.udharAmount ? new Decimal(dto.udharAmount) : new Decimal(0)),
              isInterState,
              cgstAmount: lineItems.reduce((sum, i) => sum.plus(i.cgstAmount), new Decimal(0)),
              sgstAmount: lineItems.reduce((sum, i) => sum.plus(i.sgstAmount), new Decimal(0)),
              igstAmount: lineItems.reduce((sum, i) => sum.plus(i.igstAmount), new Decimal(0)),
              notes: dto.notes ?? null,
              shiftId: dto.shiftId ?? null,
              items: { create: lineItems }
            },
            include: { items: true, customer: true }
          });

          // Step H: InventoryLog
          await tx.inventoryLog.createMany({
            data: dto.items.map(item => {
              const product = productMap.get(item.productId)!;
              const deduction = stockDeductions.find(d => d.productId === item.productId)!;
              return {
                productId: item.productId,
                shopId: user.shopId,
                type: 'SALE',
                quantityBefore: product.currentStock,
                quantityChange: -item.quantity,
                quantityAfter: deduction.newStock,
                invoiceId: invoice.id,
                recordedById: user.userId
              };
            })
          });

          // Step I: Udhar Update
          if ((dto.paymentMode === 'UDHAR' || dto.paymentMode === 'SPLIT') && dto.customerId && customer) {
            const udharAmt = dto.paymentMode === 'UDHAR' ? finalTotal : new Decimal(dto.udharAmount ?? 0);
            if (udharAmt.greaterThan(0)) {
              const currentBalance = new Decimal(customer.outstandingBalance.toString());
              const newBalance = currentBalance.plus(udharAmt);

              await tx.udharTransaction.create({
                data: {
                  customerId: dto.customerId,
                  shopId: user.shopId,
                  invoiceId: invoice.id,
                  recordedById: user.userId,
                  type: 'CREDIT',
                  amount: udharAmt,
                  balanceBefore: currentBalance,
                  balanceAfter: newBalance,
                  notes: `Bill ${invoiceNumber}`
                }
              });

              await tx.customer.update({
                where: { id: dto.customerId },
                data: {
                  outstandingBalance: newBalance,
                  totalPurchases: { increment: finalTotal.toNumber() },
                  lastPurchaseAt: new Date()
                }
              });
            }
          } else if (dto.customerId) {
            await tx.customer.update({
              where: { id: dto.customerId },
              data: {
                totalPurchases: { increment: finalTotal.toNumber() },
                lastPurchaseAt: new Date()
              }
            });
          }

          // Step J: Shift update
          if (dto.shiftId) {
            const paymentField = {
              CASH: 'cashSales', UPI: 'upiSales', CARD: 'cardSales', UDHAR: 'udharSales', SPLIT: 'cashSales'
            }[dto.paymentMode] ?? 'cashSales';

            await tx.shift.update({
              where: { id: dto.shiftId },
              data: {
                totalSales: { increment: finalTotal.toNumber() },
                [paymentField]: { increment: finalTotal.toNumber() }
              }
            });
          }

          // Step K: Audit Log
          await tx.auditLog.create({
            data: {
              shopId: user.shopId,
              userId: user.userId,
              action: 'CREATE',
              entity: 'Invoice',
              entityId: invoice.id,
              afterData: { invoiceNumber, totalAmount: finalTotal.toString(), itemCount: dto.items.length },
              ipAddress: user.ipAddress
            }
          });

          return invoice;
        }, {
          timeout: 10000,
          maxWait: 5000,
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
        });

        this.inventoryGateway.broadcastStockUpdate(user.shopId, stockDeductions);
        this.billingHelpers.checkLowStockAlerts(user.shopId, stockDeductions);

        return result;

      } catch (error: any) {
        if (error.message === 'OPTIMISTIC_LOCK_CONFLICT' && attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          const freshProducts = await this.prisma.product.findMany({
            where: { id: { in: productIds }, shopId: user.shopId },
            select: { id: true, name: true, currentStock: true, stockVersion: true, sellingPrice: true, costPrice: true, gstRate: true, hsnCode: true, unit: true }
          });
          freshProducts.forEach(p => productMap.set(p.id, p as any));
          continue;
        }

        for (const doneItem of decrementedInRedis) {
          await this.inventoryCache.restoreStock(user.shopId, doneItem.productId, doneItem.quantity);
        }
        throw error;
      }
    }

    throw new ConflictException({
      message: 'Could not complete the bill due to high concurrent activity. Please try again.',
      code: 'MAX_RETRIES_EXCEEDED'
    });
  }
}
