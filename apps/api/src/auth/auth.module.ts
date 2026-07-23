import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../config/domains/jwt.config';
import { AuthController } from './auth.controller';
import { RolesGuard } from './roles.guard';
import { AuthBypassModule } from './auth-bypass.module';

@Module({
  imports: [
    AuthBypassModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [JwtConfig],
      useFactory: async (jwtConfig: JwtConfig) => ({
        secret: jwtConfig.jwtSecret,
        signOptions: { expiresIn: jwtConfig.jwtExpiresIn } as any,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
