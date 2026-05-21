import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from '../src/billing/billing.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { PaymentMode } from '@prisma/client';

describe('Billing Concurrency', () => {
  let billingService: BillingService;
  let prisma: PrismaService;

  beforeAll(async () => {
    // For a real app, this should configure the testing module.
    // Assuming PrismaService and BillingService are provided properly.
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        PrismaService,
        // Mock the gateway, cache and helpers
        { provide: 'InventoryGateway', useValue: { broadcastStockUpdate: jest.fn(), broadcastLowStockAlert: jest.fn() } },
        { provide: 'InventoryCacheService', useValue: { tryDecrementStock: jest.fn().mockResolvedValue('cache_miss'), restoreStock: jest.fn() } },
        { provide: 'BillingHelpers', useValue: { checkLowStockAlerts: jest.fn() } }
      ],
    }).compile();

    billingService = moduleRef.get<BillingService>(BillingService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
  });

  it('should prevent overselling and allow exactly 1 success out of 5 concurrent requests', async () => {
    // 1. Setup mock data
    const shop = await prisma.shop.create({ data: { name: 'Test Shop', ownerId: 'test-owner' } });
    const user = await prisma.user.create({ data: { email: 'test@test.com', name: 'Tester', role: 'CASHIER', password: 'pass', shopId: shop.id } });
    
    // Create a product with currentStock = 1
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        sku: 'TEST-123',
        costPrice: 10,
        sellingPrice: 20,
        mrp: 20,
        unit: 'PCS',
        currentStock: 1,
        stockVersion: 0,
        shopId: shop.id
      }
    });

    // 2. Fire 5 simultaneous requests
    const requests = Array(5).fill(0).map((_, idx) => 
      billingService.createInvoice({
        items: [{ productId: product.id, quantity: 1 }],
        paymentMode: PaymentMode.CASH,
        idempotencyKey: `unique-key-${idx}` // DIFFERENT keys to bypass idempotency check for this specific test
      }, { userId: user.id, shopId: shop.id })
    );

    const results = await Promise.allSettled(requests);

    // 3 & 4. Assert 1 success and 4 conflicts
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);

    rejected.forEach(rej => {
      // @ts-ignore
      expect(rej.reason).toBeInstanceOf(ConflictException);
      // @ts-ignore
      expect(rej.reason.response.code).toBe('INSUFFICIENT_STOCK');
    });

    // 5. Assert product's final currentStock is exactly 0
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalProduct!.currentStock.toNumber()).toBe(0);
    expect(finalProduct!.stockVersion).toBe(1); // incremented exactly once

    // 6. Assert exactly 1 InvoiceItem and 1 InventoryLog entry exist
    const invoiceItems = await prisma.invoiceItem.findMany({ where: { productId: product.id } });
    expect(invoiceItems.length).toBe(1);

    const logs = await prisma.inventoryLog.findMany({ where: { productId: product.id } });
    expect(logs.length).toBe(1);
  });

  it('should test idempotency - prevent duplicate bills on retry', async () => {
    // 1. Call createInvoice with same idempotencyKey
    const shopId = (await prisma.shop.findFirst())!.id;
    const userId = (await prisma.user.findFirst())!.id;
    const product = await prisma.product.findFirst();

    // Give some stock
    await prisma.product.update({ where: { id: product!.id }, data: { currentStock: 10 } });

    const dto = {
      items: [{ productId: product!.id, quantity: 1 }],
      paymentMode: PaymentMode.CASH,
      idempotencyKey: 'idem-test-123'
    };

    const firstCall = await billingService.createInvoice(dto, { userId, shopId });
    const secondCall = await billingService.createInvoice(dto, { userId, shopId });

    // Assert both return exact same invoice
    expect(firstCall.id).toBe(secondCall.id);

    // Assert only 1 Invoice row exists with that key
    const count = await prisma.invoice.count({ where: { idempotencyKey: 'idem-test-123' } });
    expect(count).toBe(1);
  });
});
