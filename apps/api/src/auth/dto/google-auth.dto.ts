import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google OpenID Connect ID token issued for this application' })
  @IsJWT()
  idToken: string;
}
