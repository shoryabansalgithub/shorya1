import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SafeUserDto } from '../users/dto/safe-user.dto';

export interface LoginResponseDto {
  access_token: string;
  user: SafeUserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUserDto | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      return null;
    }

    if (user.isDeleted) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
      return null;
    }

    const passwordValid = await bcrypt.compare(pass, user.password);
    if (!passwordValid) {
      await this.usersService.incrementFailedAttempts(user.id);
      return null;
    }

    await this.usersService.resetFailedAttempts(user.id);
    return this.usersService.findSafeById(user.id);
  }

  async login(user: SafeUserDto): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role, shopId: user.shopId };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
