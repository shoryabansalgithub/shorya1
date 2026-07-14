import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { BullModule } from '@nestjs/bullmq';
import { redisStore } from 'cache-manager-redis-yet';

import { EnterpriseConfigModule } from './config/enterprise-config.module';
import { RedisConfig } from './config/domains/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BillingModule } from './billing/billing.module';
import { InventoryModule } from './inventory/inventory.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomersModule } from './customers/customers.module';
import { OcrModule } from './ocr/ocr.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { TenantGuard } from './iam/guards/tenant.guard';
import { IamModule } from './iam/iam.module';
import { CronLockModule } from './common/cron-lock/cron-lock.module';
import { OutboxModule } from './common/outbox/outbox.module';
import { CorrelationModule } from './common/correlation/correlation.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductVersioningModule } from './product-versioning/product-versioning.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { ProductIdentityModule } from './product-identity/product-identity.module';
import { ProductMediaModule } from './product-media/product-media.module';
import { ProductSearchModule } from './product-search/product-search.module';
import { ProductValidationModule } from './product-validation/product-validation.module';
import { ImportExportModule } from './import-export/import-export.module';
import { ProductEventsModule } from './product-events/product-events.module';
import { InventoryDomainModule } from './inventory-domain/inventory-domain.module';
import { WarehouseModule } from './warehouse-domain/warehouse.module';
import { StockLedgerModule } from './stock-ledger-domain/stock-ledger.module';
import { ReservationModule } from './reservation-domain/reservation.module';
import { StockCountModule } from './stock-count-domain/stock-count.module';
import { BatchModule } from './batch-domain/batch.module';
import { EventsModule } from './events-domain/events.module';
import { AnalyticsModule } from './analytics-domain/analytics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SalesDomainModule } from './sales-domain/sales-domain.module';
import { PricingDomainModule } from './pricing-domain/pricing-domain.module';
import { InvoiceDomainModule } from './invoice-domain/invoice-domain.module';
import { PaymentDomainModule } from './payment-domain/payment-domain.module';
import { ReturnsDomainModule } from './returns-domain/returns-domain.module';
import { AnalyticsDomainModule } from './analytics-domain/analytics-domain.module';
import { SalesEventsDomainModule } from './sales-events-domain/sales-events-domain.module';
import { PurchaseDomainModule } from './purchase-domain/purchase-domain.module';
import { GrnDomainModule } from './grn-domain/grn-domain.module';
import { VendorBillDomainModule } from './vendor-bill-domain/vendor-bill-domain.module';
import { PurchaseReturnDomainModule } from './purchase-return-domain/purchase-return-domain.module';
import { SupplierCreditDomainModule } from './supplier-credit-domain/supplier-credit-domain.module';
import { ProcurementWorkflowDomainModule } from './procurement-workflow-domain/procurement-workflow-domain.module';
import { PurchaseAnalyticsDomainModule } from './purchase-analytics-domain/purchase-analytics-domain.module';
import { PurchaseEventsDomainModule } from './purchase-events-domain/purchase-events-domain.module';
import { DocumentModule } from './common/document/document.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    EnterpriseConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [RedisConfig],
      useFactory: async (redisConfig: RedisConfig) => {
        if (redisConfig.redisUrl) {
          return {
            store: redisStore as any,
            url: redisConfig.redisUrl,
            ttl: 3600 * 1000,
          } as any;
        }
        return { ttl: 3600 * 1000 } as any;
      },
    }),
    BullModule.forRootAsync({
      inject: [RedisConfig],
      useFactory: (redisConfig: RedisConfig) => ({
        connection: {
          url: redisConfig.redisUrl,
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    PrismaModule,
    StorageModule,
    UsersModule,
    AuthModule,
    BillingModule,
    InventoryModule,
    CustomersModule,
    OcrModule,
    CronLockModule,
    OutboxModule,
    CorrelationModule,
    IamModule,
    InvitationsModule,
    ShopsModule,
    ProductsModule,
    CategoriesModule,
    ProductVersioningModule,
    ProductVariantsModule,
    ProductIdentityModule,
    ProductMediaModule,
    ProductSearchModule,
    ProductValidationModule,
    ImportExportModule,
    ProductEventsModule,
    InventoryDomainModule,
    WarehouseModule,
    StockLedgerModule,
    ReservationModule,
    StockCountModule,
    BatchModule,
    EventsModule,
    AnalyticsModule,
    SalesDomainModule,
    PricingDomainModule,
    InvoiceDomainModule,
    PaymentDomainModule,
    ReturnsDomainModule,
    AnalyticsDomainModule,
    SalesEventsDomainModule,
    PurchaseDomainModule,
    GrnDomainModule,
    VendorBillDomainModule,
    PurchaseReturnDomainModule,
    SupplierCreditDomainModule,
    ProcurementWorkflowDomainModule,
    PurchaseAnalyticsDomainModule,
    PurchaseEventsDomainModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards — execution order follows registration order:
    // 1. ThrottlerGuard  (rate limiting)
    // 2. JwtAuthGuard    (authentication)
    // 3. TenantGuard     (tenant isolation — rejects shopId=null)
    // 4. RolesGuard      (authorization — checks @Roles() metadata)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
