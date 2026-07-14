import { Injectable } from '@nestjs/common';
import { IsOptional, IsArray } from 'class-validator';

@Injectable()
export class FileUploadConfig {
  @IsOptional()
  @IsArray()
  allowedExtensions?: string[];
}
