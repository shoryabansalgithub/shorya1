import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserDto } from './dto/safe-user.dto';
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

    try {
      const user: SafeUserRecord = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: Role.CASHIER,
          password: hashedPassword,
        },
        select: safeUserSelect,
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
