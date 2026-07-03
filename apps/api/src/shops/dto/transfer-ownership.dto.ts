import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TransferOwnershipDto {
  @ApiProperty({ description: 'The ID of the new owner (must be an existing user in the shop)' })
  @IsString()
  @IsNotEmpty()
  newOwnerId: string;

  @ApiProperty({ description: 'The current owner password for security verification' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
