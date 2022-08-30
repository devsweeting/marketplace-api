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
  @MinLength(8)
  public password: string;

  // Add the refreshToken property to this dto
  @ApiProperty({
    example: 'refresh token',
    description: 'Refresh the access token',
  })
  @ApiProperty({ example: 'its a secret key' })
  @IsString()
  @IsNotEmpty()
  public refreshToken: string;
}
