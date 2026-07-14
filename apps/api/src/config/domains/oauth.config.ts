import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class OAuthConfig {
  @IsOptional()
  @IsString()
  googleClientId?: string;
}
