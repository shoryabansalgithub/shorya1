import { Injectable } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
export class DatabaseConfig {
  @IsString()
  @IsNotEmpty()
  readonly databaseUrl: string;
}
