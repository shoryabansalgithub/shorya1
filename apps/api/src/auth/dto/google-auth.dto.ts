import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google account unique ID (sub claim)' })
  @IsString()
  googleId: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  name: string;
}
