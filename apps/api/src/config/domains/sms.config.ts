import { Injectable } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';

@Injectable()
export class SmsConfig {
  @IsOptional()
  @IsString()
  twilioSid?: string;
}
