import { Injectable } from '@nestjs/common';
import { IsOptional, IsNumber } from 'class-validator';

@Injectable()
export class SecurityConfig {
  @IsOptional()
  @IsNumber()
  bcryptRounds?: number;
}
