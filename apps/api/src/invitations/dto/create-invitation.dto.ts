import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;
}
