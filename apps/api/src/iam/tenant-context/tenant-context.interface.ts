import { Role, ShopStatus } from '@prisma/client';

export interface TenantContext {
  readonly shopId?: string;
  readonly userId?: string;
  readonly role?: Role;
  readonly email?: string;
  readonly correlationId: string;
  readonly requestId: string;
  readonly sessionId?: string;
  readonly tokenVersion?: number;
  readonly shopStatus?: ShopStatus;
  readonly tenantTimezone?: string;
  readonly isSuperAdminBypass?: boolean;
}
