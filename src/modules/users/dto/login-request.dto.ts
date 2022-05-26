import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    example: 'test@mail.com',
    description: 'The email of the User',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
