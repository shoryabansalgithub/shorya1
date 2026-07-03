import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/public.decorator';
import { IS_SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';
import { SafeUserDto } from '../../users/dto/safe-user.dto';
import { ShopStatus } from '@prisma/client';

interface RequestWithUser {
  user?: SafeUserDto;
}

/**
 * Global guard that enforces tenant isolation by rejecting authenticated
 * requests where the user has no shop assignment (shopId = null).
 *
 * Execution order (via APP_GUARD registration):
 *   ThrottlerGuard → JwtAuthGuard → TenantGuard → RolesGuard
 *
 * Bypassed when:
 *   - Route is marked @Public() (unauthenticated routes)
 *   - Route is marked @SkipTenantCheck() (super-admin/system routes)
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip for public routes (no user present)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Skip for routes that intentionally operate without tenant context
    const isSkipTenant = this.reflector.getAllAndOverride<boolean>(
      IS_SKIP_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isSkipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // If JwtAuthGuard already rejected (no user), let it handle the 401.
    // TenantGuard only fires after successful JWT validation.
    if (!user) {
      return true;
    }

    if (!user.shopId) {
      this.logger.warn(
        `Tenant guard rejected user ${user.id} (${user.email}) — no shop assignment`,
      );
      throw new ForbiddenException(
        'Your account is not assigned to any shop. Contact your administrator.',
      );
    }

    if (user.shopStatus === ShopStatus.LOCKED) {
      throw new ForbiddenException('This shop has been locked for security reasons.');
    }

    if (user.shopStatus === ShopStatus.DELETED) {
      throw new ForbiddenException('This shop has been deleted.');
    }

    return true;
  }
}
