import { Injectable } from '@nestjs/common';
import { ConfigDomain, EnvVariable } from '../registry/registry.decorators';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
@ConfigDomain({ owner: 'Jwt', feature: 'Configuration', version: '1.0.0', description: 'JwtConfig Domain' })
export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  @EnvVariable('JWT_SECRET')
  readonly jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  @EnvVariable('JWT_EXPIRES_IN')
  readonly jwtExpiresIn: string;

  @IsString()
  @IsNotEmpty()
  @EnvVariable('JWT_REFRESH_SECRET')
  readonly jwtRefreshSecret: string;

  @IsString()
  @IsNotEmpty()
  @EnvVariable('JWT_REFRESH_EXPIRES_IN')
  readonly jwtRefreshExpiresIn: string;
}
