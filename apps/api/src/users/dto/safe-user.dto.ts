import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Role, ShopStatus } from '@prisma/client';

export class SafeUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiPropertyOptional()
  @Expose()
  phone: string | null;

  @ApiProperty({ enum: Role })
  @Expose()
  role: Role;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  shopId: string;

  @ApiProperty({ enum: ShopStatus })
  @Expose()
  shopStatus: ShopStatus;

  @ApiProperty()
  @Expose()
  tokenVersion: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
