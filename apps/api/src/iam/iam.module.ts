

/**
 * IAM Module — Identity & Access Management infrastructure.
 *
 * Provides:
 *   - TenantGuard (registered globally in AppModule)
 *   - @CurrentUser(), @CurrentShop() decorators
 *   - @SkipTenantCheck() decorator
 *   - @Permissions() decorator (metadata-only, future enforcement)
 *
 * Guards are registered as APP_GUARD providers in AppModule,
 * not here — this ensures correct execution order.
 *
 * Decorators are pure metadata — no module registration needed.
 * This module exists as a structural anchor for future IAM services
 * (PermissionCacheService, SessionService, etc.).
 */
import { Module, Global } from '@nestjs/common';
import { TenantContextModule } from './tenant-context/tenant-context.module';
import { SocketSessionService } from './websockets/socket-session.service';

@Global()
@Module({
  imports: [TenantContextModule],
  providers: [SocketSessionService],
  exports: [TenantContextModule, SocketSessionService],
})
export class IamModule {}
