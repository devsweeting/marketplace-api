import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PartnerUserDto {
  @ApiProperty({
    description: 'Reference ID from the partners system',
    example: '123456789',
  })
  refId: string;

  @IsNotEmpty()
  @ApiProperty({
    description: "User's email address provided by the partners system",
    required: true,
    example: 'steven@example.com',
  })
  email: string;
}
