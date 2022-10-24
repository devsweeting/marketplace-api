import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'test@mail.com',
    description: 'The email of the User',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty({
    example: 'password',
    description: 'The password of the User',
  })
  @ApiProperty({ example: 'test123' })
  @IsString()
  @IsNotEmpty()
  // eslint-disable-next-line no-magic-numbers
  @MinLength(8)
  public password: string;
}
