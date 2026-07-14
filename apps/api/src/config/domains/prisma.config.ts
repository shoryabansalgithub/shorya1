import { Injectable } from '@nestjs/common';
import { IsOptional, IsBoolean } from 'class-validator';

@Injectable()
export class PrismaConfig {
  @IsOptional()
  @IsBoolean()
  logQueries?: boolean;
}
