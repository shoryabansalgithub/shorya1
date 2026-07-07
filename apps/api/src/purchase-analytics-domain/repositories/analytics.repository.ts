import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  // Low-level snapshot insertion utilized heavily by the Background Jobs
  
  async upsertDashboardSnapshot(shopId: string, date: Date, data: any) {
    // Normalize date to midnight UTC for unique grouping
    const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    
    return this.prisma.purchaseAnalyticsSnapshot.upsert({
      where: {
        shopId_date: { shopId, date: normalizedDate }
      },
      update: {
        totalPurchases: data.totalPurchases,
        totalOrdersCount: data.totalOrdersCount,
        pendingOrdersCount: data.pendingOrdersCount,
        pendingGrnsCount: data.pendingGrnsCount,
        pendingBillsCount: data.pendingBillsCount,
        outstandingPayables: data.outstandingPayables,
        averageLeadTimeDays: data.averageLeadTimeDays,
        averageApprovalHours: data.averageApprovalHours
      },
      create: {
        shopId,
        date: normalizedDate,
        ...data
      }
    });
  }

  async upsertVendorPerformanceSnapshot(shopId: string, supplierId: string, data: any) {
    return this.prisma.vendorPerformanceSnapshot.upsert({
      where: {
        shopId_supplierId: { shopId, supplierId }
      },
      update: {
        purchaseVolume: data.purchaseVolume,
        orderCount: data.orderCount,
        onTimeDeliveryPct: data.onTimeDeliveryPct,
        averageLeadTimeDays: data.averageLeadTimeDays,
        defectRatePct: data.defectRatePct,
        returnRatePct: data.returnRatePct,
        overallScore: data.overallScore,
        lastCalculatedAt: new Date()
      },
      create: {
        shopId,
        supplierId,
        ...data
      }
    });
  }

  async upsertCategorySpendSnapshot(shopId: string, categoryId: string, data: any) {
    return this.prisma.purchaseCategorySpendSnapshot.upsert({
      // We assume departmentId is null for this simple aggregation
      where: {
        shopId_categoryId_departmentId: { shopId, categoryId, departmentId: '' } // empty string or null depending on schema
      },
      update: {
        totalSpend: data.totalSpend,
        growthPct: data.growthPct
      },
      create: {
        shopId,
        categoryId,
        departmentId: '',
        ...data
      }
    });
  }

  async upsertTrendSnapshot(shopId: string, periodType: string, periodStart: Date, data: any) {
    return this.prisma.purchaseTrendSnapshot.upsert({
      where: {
        shopId_periodType_periodStart: { shopId, periodType, periodStart }
      },
      update: {
        spendAmount: data.spendAmount,
        orderCount: data.orderCount
      },
      create: {
        shopId,
        periodType,
        periodStart,
        ...data
      }
    });
  }
}
