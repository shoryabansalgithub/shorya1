import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthBypassService } from './auth-bypass.service';

describe('JwtAuthGuard', () => {
  const systemUser = { id: 'user-1', email: 'system@dukaanai.local', role: 'OWNER' };

  function buildContext(request: Record<string, unknown> = {}): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  function buildGuard(bypassEnabled: boolean, isPublic = false) {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(isPublic),
    } as unknown as Reflector;
    const bypass = {
      isEnabled: bypassEnabled,
      getSystemUser: jest.fn().mockResolvedValue(systemUser),
    };
    const guard = new JwtAuthGuard(reflector, bypass as unknown as AuthBypassService);
    return { guard, bypass };
  }

  it('allows @Public routes without consulting the bypass', () => {
    const { guard, bypass } = buildGuard(false, true);
    expect(guard.canActivate(buildContext())).toBe(true);
    expect(bypass.getSystemUser).not.toHaveBeenCalled();
  });

  it('delegates to real JWT validation when the bypass is off', () => {
    const superCanActivate = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);
    try {
      const { guard, bypass } = buildGuard(false);
      const request: Record<string, unknown> = {};

      expect(guard.canActivate(buildContext(request))).toBe(true);
      expect(superCanActivate).toHaveBeenCalledTimes(1);
      expect(bypass.getSystemUser).not.toHaveBeenCalled();
      expect(request.user).toBeUndefined();
    } finally {
      superCanActivate.mockRestore();
    }
  });

  it('injects the system user and skips JWT validation when the bypass is on', async () => {
    const superCanActivate = jest.spyOn(AuthGuard('jwt').prototype, 'canActivate');
    try {
      const { guard } = buildGuard(true);
      const request: Record<string, unknown> = {};

      await expect(guard.canActivate(buildContext(request))).resolves.toBe(true);
      expect(request.user).toEqual(systemUser);
      expect(superCanActivate).not.toHaveBeenCalled();
    } finally {
      superCanActivate.mockRestore();
    }
  });
});
