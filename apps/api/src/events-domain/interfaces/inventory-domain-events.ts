export enum InventoryDomainEventType {
  InventoryCreated = 'InventoryCreated',
  InventoryUpdated = 'InventoryUpdated',
  InventoryAdjusted = 'InventoryAdjusted',
  InventoryTransferred = 'InventoryTransferred',
  InventoryReserved = 'InventoryReserved',
  InventoryReleased = 'InventoryReleased',
  InventoryBatchExpired = 'InventoryBatchExpired',
  InventorySnapshotCreated = 'InventorySnapshotCreated',
}

export interface BaseDomainEvent<T = any> {
  eventId: string;
  shopId: string;
  eventType: InventoryDomainEventType;
  aggregateType: string;
  aggregateId: string;
  payload: T;
  version: string;
  timestamp: string;
  correlationId?: string;
  causationId?: string;
}

export interface InventoryReservedPayload {
  reservationId: string;
  source: string;
  items: any[];
}

export interface InventoryAdjustedPayload {
  adjustmentId: string;
  reason: string;
  items: any[];
}
