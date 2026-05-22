import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
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
      where: { id },
      select: safeUserSelect,
    });

    return user ? UserMapper.toSafeUserDto(user) : null;
  }

  async create(data: CreateUserDto): Promise<SafeUserDto> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user: SafeUserRecord = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role ?? Role.ADMIN,
        shopId: data.shopId,
        password: hashedPassword,
      },
      select: safeUserSelect,
    });

    return UserMapper.toSafeUserDto(user);
  }
}
