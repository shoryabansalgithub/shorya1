import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('employees')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  async getEmployees(@Request() req: any) {
    return this.prisma.user.findMany({
      where: { shopId: req.user.shopId, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isLocked: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
