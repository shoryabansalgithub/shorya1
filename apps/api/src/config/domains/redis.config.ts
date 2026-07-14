import { Injectable } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

@Injectable()
export class RedisConfig {
  @IsString()
  @IsNotEmpty()
  readonly redisUrl: string;
}
