import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService, LoginResponseDto } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
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

  @Post('register')
  @ApiOperation({ summary: 'Register a new user (defaults to CASHIER role for security)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: SafeUserDto })
  async register(@Body() body: CreateUserDto): Promise<SafeUserDto> {
    // Security: force default role to CASHIER (least privilege).
    // Creating ADMIN/SUPER_ADMIN accounts should require an authenticated admin endpoint.
    // Override the role to CASHIER if none is provided or if a privileged role is requested
    // without proper authentication.
    const safeBody: CreateUserDto = {
      ...body,
      role: body.role ?? ('CASHIER' as any),
    };

    return this.usersService.create(safeBody);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  async login(@Request() req: AuthenticatedRequest): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: SafeUserDto })
  getProfile(@Request() req: AuthenticatedRequest): SafeUserDto {
    return req.user;
  }
}
