import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

/**
 * Param decorator that extracts the authenticated user from the request.
 * Replaces all `@Request() req: any` → `req.user` patterns with compile-time type safety.
 *
 * Usage:
 *   getProfile(@CurrentUser() user: SafeUserDto)
 *   getUserId(@CurrentUser('id') userId: string)
 */
export const CurrentUser = createParamDecorator(
  (data: keyof SafeUserDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SafeUserDto;
    return data ? user?.[data] : user;
  },
);
