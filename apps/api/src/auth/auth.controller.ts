import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService, LoginResponseDto } from './auth.service';
import { Public } from './public.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SafeUserDto } from '../users/dto/safe-user.dto';
import type { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
  user: SafeUserDto;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ short: { limit: 3, ttl: 1000 }, medium: { limit: 10, ttl: 10000 }, long: { limit: 30, ttl: 30000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user (defaults to CASHIER role for security)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: SafeUserDto })
  async register(@Body() body: CreateUserDto): Promise<SafeUserDto> {
    // Security: force default role to CASHIER (least privilege) inside usersService.
    // DTO mass assignment protection strips unknown fields.
    const safeBody: CreateUserDto = {
      email: body.email,
      password: body.password,
      name: body.name,
    };

    return this.usersService.create(safeBody);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 1000 }, medium: { limit: 15, ttl: 10000 }, long: { limit: 30, ttl: 30000 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  async login(@Request() req: AuthenticatedRequest): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: SafeUserDto })
  getProfile(@Request() req: AuthenticatedRequest): SafeUserDto {
    return req.user;
  }
}
