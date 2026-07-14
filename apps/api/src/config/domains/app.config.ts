import { Injectable } from '@nestjs/common';
import { IsNumber, IsString, IsUrl, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

@Injectable()
export class AppConfig {
  @IsEnum(Environment)
  readonly nodeEnv: Environment;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  readonly port: number;

  @IsString()
  readonly frontendUrl: string;
}
