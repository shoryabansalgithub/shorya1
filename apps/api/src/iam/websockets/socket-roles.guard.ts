import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../auth/roles.decorator';
import { Role } from '@prisma/client';
import { Socket } from 'socket.io';

const ROLE_WEIGHT: Record<Role, number> = {
  [Role.VIEWER]: 10,
  [Role.CASHIER]: 20,
  [Role.MANAGER]: 30,
  [Role.ADMIN]: 40,
  [Role.OWNER]: 50,
  [Role.SUPER_ADMIN]: 100,
};

@Injectable()
export class SocketRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'ws') {
      return true; // Let HTTP guards handle HTTP
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const client = context.switchToWs().getClient<Socket>();
    const userRole = client.data.role as Role;

    if (!userRole) {
      throw new ForbiddenException('Access denied: Role missing from socket context');
    }

    // Exact match or Super Admin
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }

    // Allow if user has a role with equal or higher weight than the minimum required role
    const minRequiredWeight = Math.min(...requiredRoles.map(r => ROLE_WEIGHT[r]));
    const userWeight = ROLE_WEIGHT[userRole];

    if (userWeight >= minRequiredWeight) {
      return true;
    }

    throw new ForbiddenException('Access denied: Insufficient privileges for this realtime action');
  }
}
