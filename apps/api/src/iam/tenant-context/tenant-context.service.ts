import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { TenantContext } from './tenant-context.interface';

@Injectable()
export class TenantContextService {
  private static readonly als = new AsyncLocalStorage<TenantContext>();

  static get asAsyncLocalStorage() {
    return this.als;
  }

  get context(): TenantContext {
    const store = TenantContextService.als.getStore();
    if (!store) {
      throw new InternalServerErrorException(
        'Tenant context is not initialized. Ensure the interceptor or middleware is configured correctly.',
      );
    }
    return store;
  }

  isSuperAdminBypass(): boolean {
    const store = TenantContextService.als.getStore();
    return store?.isSuperAdminBypass === true;
  }

  getShopId(): string {
    const shopId = this.context.shopId;
    if (!shopId) {
      throw new InternalServerErrorException('Tenant context exists but shopId is missing.');
    }
    return shopId;
  }

  getUserId(): string {
    const userId = this.context.userId;
    if (!userId) {
      throw new InternalServerErrorException('Tenant context exists but userId is missing.');
    }
    return userId;
  }

  getRole() {
    const role = this.context.role;
    if (!role) {
      throw new InternalServerErrorException('Tenant context exists but role is missing.');
    }
    return role;
  }
  
  getCorrelationId(): string {
    return this.context.correlationId;
  }

  // Method to safely run background jobs or specific execution boundaries
  runWithContext<R>(context: TenantContext, callback: () => R): R {
    return TenantContextService.als.run(context, callback);
  }

  // Safely execute operations without tenant isolation (e.g. background cleanup, migrations)
  runAsSuperAdmin<R>(callback: () => R): R {
    const currentContext = TenantContextService.als.getStore();
    const elevatedContext: TenantContext = currentContext 
      ? { ...currentContext, isSuperAdminBypass: true } 
      : { correlationId: 'system', requestId: 'system', isSuperAdminBypass: true };
      
    return TenantContextService.als.run(elevatedContext, callback);
  }
}
