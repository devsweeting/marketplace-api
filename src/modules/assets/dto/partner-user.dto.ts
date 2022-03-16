import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PartnerUserDto {
  @ApiProperty({
    description: 'Reference ID from the partners system',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsString()
  public refId: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: "User's email address provided by the partners system",
    required: true,
    example: 'steven@example.com',
  })
  public email: string;
}
