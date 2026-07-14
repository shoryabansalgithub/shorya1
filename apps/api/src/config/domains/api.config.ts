import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class ApiConfig {
  @IsOptional()
  @IsString()
  baseUrl?: string;
}
