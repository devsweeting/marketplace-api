import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserLoginMetadata } from '../interfaces/user-login-metadata';

export class LoginConfirmDto {
  @ApiProperty({
    example: 'xyz',
    description: 'OTP token',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  metadata: UserLoginMetadata;
}
