import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
import * as crypto from 'crypto';
import {
  SafeUserRecord,
  UserMapper,
  UserWithPasswordRecord,
  safeUserSelect,
  userWithPasswordSelect,
} from './user.mapper';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPasswordRecord | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userWithPasswordSelect,
    });
  }

  async findSafeById(id: string): Promise<SafeUserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: safeUserSelect,
    });

    return user ? UserMapper.toSafeUserDto(user) : null;
  }

  async findByIdWithSecurity(id: string): Promise<UserWithPasswordRecord | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: userWithPasswordSelect,
    });
  }

  async create(data: CreateUserDto): Promise<SafeUserDto> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const userId = crypto.randomUUID();
    const shopId = crypto.randomUUID();

    try {
      const user: SafeUserRecord = await this.prisma.$transaction(async (tx) => {
        await tx.shop.create({
          data: {
            id: shopId,
            name: data.shopName,
            ownerId: userId,
          },
        });

        const createdUser = await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            name: data.name,
            role: Role.OWNER,
            password: hashedPassword,
            shopId: shopId,
          },
          select: safeUserSelect,
        });

        return createdUser;
      });

      return UserMapper.toSafeUserDto(user);
    } catch (error) {
      // Handle unique constraint violation on email
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists');
      }
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * Provision a user from Google OAuth.
   *
   * Resolution order:
   * 1. Existing user matched by googleId → return immediately
   * 2. Existing user matched by email → link googleId and return (account linking)
   * 3. New user → create user + shop in a transaction, role = OWNER
   *
   * Google users have no password set; they authenticate exclusively via OAuth.
   */
  async findOrCreateGoogleUser(
    googleId: string,
    email: string,
    name: string,
  ): Promise<SafeUserDto> {
    // 1. Match by Google ID — returning user
    const byGoogle = await this.prisma.user.findUnique({
      where: { googleId },
      select: safeUserSelect,
    });
    if (byGoogle) return UserMapper.toSafeUserDto(byGoogle);

    // 2. Match by email — account linking for existing password users
    const byEmail = await this.prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });
    if (byEmail) {
      const updated = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId },
        select: safeUserSelect,
      });
      this.logger.log(`Linked Google account to existing user ${byEmail.id}`);
      return UserMapper.toSafeUserDto(updated);
    }

    // 3. New user — create user + shop atomically
    const userId = crypto.randomUUID();
    const shopId = crypto.randomUUID();

    try {
      const user: SafeUserRecord = await this.prisma.$transaction(async (tx) => {
        await tx.shop.create({
          data: {
            id: shopId,
            name: `${name}'s Shop`,
            ownerId: userId,
          },
        });

        return tx.user.create({
          data: {
            id: userId,
            email,
            name,
            googleId,
            role: Role.OWNER,
            shopId,
          },
          select: safeUserSelect,
        });
      });

      this.logger.log(`Created new Google OAuth user ${userId}`);
      return UserMapper.toSafeUserDto(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Race: another request created the user between our lookups
        const retry = await this.prisma.user.findUnique({
          where: { email },
          select: safeUserSelect,
        });
        if (retry) return UserMapper.toSafeUserDto(retry);
      }
      this.logger.error('Failed to create Google OAuth user', error);
      throw error;
    }
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failedAttempts: true },
    });
    
    if (!user) return;
    const newAttempts = user.failedAttempts + 1;
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: newAttempts,
        isLocked: newAttempts >= 5,
        lockedUntil: newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: 0,
        isLocked: false,
        lockedUntil: null,
      },
    });
  }
}
