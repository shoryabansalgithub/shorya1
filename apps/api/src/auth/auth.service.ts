import { Injectable } from '@nestjs/common';
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
    if (user && (await bcrypt.compare(pass, user.password))) {
      return this.usersService.findSafeById(user.id);
    }
    return null;
  }

  async login(user: SafeUserDto): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
