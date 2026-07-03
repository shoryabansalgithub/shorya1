import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * Param decorator that extracts the shopId from the authenticated user's JWT.
 * After TenantGuard runs, shopId is guaranteed to be a non-null string.
 *
 * Usage:
 *   listProducts(@CurrentShop() shopId: string)
 */
export const CurrentShop = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SafeUserDto;
    return user?.shopId as string;
  },
);
