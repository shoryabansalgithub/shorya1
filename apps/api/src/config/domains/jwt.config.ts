import { Injectable } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
export class JwtConfig {
  @IsString()
  @IsNotEmpty()
  readonly jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  readonly jwtExpiresIn: string;

  @IsString()
  @IsNotEmpty()
  readonly jwtRefreshSecret: string;

  @IsString()
  @IsNotEmpty()
  readonly jwtRefreshExpiresIn: string;
}
