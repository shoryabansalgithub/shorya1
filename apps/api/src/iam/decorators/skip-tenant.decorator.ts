import { SetMetadata } from '@nestjs/common';

export const IS_SKIP_TENANT_KEY = 'isSkipTenantCheck';

/**
 * Marks a route as exempt from TenantGuard enforcement.
 * Use ONLY for system-level or super-admin operations
 * that intentionally operate across tenants.
 *
 * Examples: global health check, super-admin user management
 */
export const SkipTenantCheck = () => SetMetadata(IS_SKIP_TENANT_KEY, true);
