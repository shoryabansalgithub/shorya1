import { plainToInstance } from 'class-transformer';
import { Prisma } from '@prisma/client';
import { SafeUserDto } from './dto/safe-user.dto';

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  isActive: true,
  shopId: true,
  tokenVersion: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userWithPasswordSelect = {
  ...safeUserSelect,
  password: true,
  isLocked: true,
  lockedUntil: true,
  isDeleted: true,
  shop: {
    select: {
      status: true,
    },
  },
} satisfies Prisma.UserSelect;

export type SafeUserRecord = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export type UserWithPasswordRecord = Prisma.UserGetPayload<{
  select: typeof userWithPasswordSelect;
}>;

export class UserMapper {
  /**
   * Security boundary: never return Prisma User entities directly.
   * Prisma entities include secrets such as password hashes; explicit DTO
   * serialization keeps sensitive fields excluded even if the schema grows.
   */
  static toSafeUserDto(user: SafeUserRecord | UserWithPasswordRecord): SafeUserDto {
    const plainUser = {
      ...user,
      shopStatus: 'shop' in user && user.shop ? user.shop.status : undefined,
    };
    return plainToInstance(SafeUserDto, plainUser, {
      excludeExtraneousValues: true,
    });
  }
}
