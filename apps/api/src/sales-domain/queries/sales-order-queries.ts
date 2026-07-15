import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesFeatureConfig } from '../../config/domains/features/sales-feature.config';

@Injectable()
export class SalesOrderQueries {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesConfig: SalesFeatureConfig
  ) {}

  /**
   * Enterprise-grade Search Query for Sales Orders.
   * Supports Cursor Pagination, Filtering, and Sorting to avoid N+1 and slow queries.
   */
  async searchOrders(shopId: string, query: {
    status?: string;
    customerId?: string;
    cursor?: string;
    limit?: number;
    sortDir?: 'asc' | 'desc';
  }) {
    const { status, customerId, cursor, limit = this.salesConfig.defaultPaginationLimit, sortDir = 'desc' } = query;

    const where: any = { shopId };
    
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const orders = await this.prisma.salesOrder.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine hasNextPage
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: sortDir },
      include: {
        lines: true
      }
    });

    const hasNextPage = orders.length > limit;
    const paginatedOrders = hasNextPage ? orders.slice(0, -1) : orders;
    const nextCursor = hasNextPage ? paginatedOrders[paginatedOrders.length - 1].id : null;

    return {
      data: paginatedOrders,
      meta: {
        hasNextPage,
        nextCursor
      }
    };
  }

  async getOrderById(shopId: string, orderId: string) {
    return this.prisma.salesOrder.findUnique({
      where: { id: orderId, shopId },
      include: {
        lines: true,
        statusHistory: true,
        auditLogs: true
      }
    });
  }
}
