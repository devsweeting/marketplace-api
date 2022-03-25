import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdatePartnerMembersDto {
  @IsNotEmpty()
  @IsArray()
  @IsEmail({}, { each: true })
  @ApiProperty({
    description: "User's email address from database",
    required: true,
    example: 'mail@example.com',
  })
  public emails: string[];
}
