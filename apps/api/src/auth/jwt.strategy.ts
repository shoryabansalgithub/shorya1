import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SafeUserDto } from '../users/dto/safe-user.dto';
import { UserMapper } from '../users/user.mapper';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  shopId: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUserDto> {
    const user = await this.usersService.findByIdWithSecurity(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    if (user.isDeleted) {
      throw new UnauthorizedException('Account has been deleted');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException('Account is locked');
    }

    return UserMapper.toSafeUserDto(user as any);
  }
}
