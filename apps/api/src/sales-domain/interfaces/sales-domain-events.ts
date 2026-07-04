export enum SalesDomainEventType {
  SalesOrderCreated = 'SalesOrderCreated',
  SalesOrderUpdated = 'SalesOrderUpdated',
  SalesOrderConfirmed = 'SalesOrderConfirmed',
  SalesOrderCancelled = 'SalesOrderCancelled',
  SalesOrderArchived = 'SalesOrderArchived',
  SalesOrderDeleted = 'SalesOrderDeleted',
  SalesOrderCommentAdded = 'SalesOrderCommentAdded',
  SalesOrderApprovalRequested = 'SalesOrderApprovalRequested',
  SalesOrderStatusChanged = 'SalesOrderStatusChanged',
}

export interface SalesOrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string | null;
  totalAmount: string;
  lines: Array<{
    productId: string;
    variantId: string | null;
    quantity: string;
    unitPrice: string;
  }>;
}

export interface SalesOrderStatusChangedPayload {
  orderId: string;
  previousStatus: string | null;
  newStatus: string;
  actorId: string | null;
  reason: string | null;
}
