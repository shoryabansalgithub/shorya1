import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Declares the permissions required to access a route.
 * Evaluated by PermissionsGuard (future Phase 2.3).
 *
 * Uses format: resource:sub-resource:action
 * Example: @Permissions('billing:invoice:create', 'billing:invoice:read')
 *
 * Currently a metadata-only decorator — guard enforcement will be added
 * when the database-driven permission system is built in Phase 2.3.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
