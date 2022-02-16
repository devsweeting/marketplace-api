import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PartnerUser {

  @ApiProperty({description: 'Reference ID from the partners system'})
  public refId: string;

  @IsNotEmpty()
  @ApiProperty({
      description: "User's email address provided by the partners system",
      required: true
  })
  public email: string;

}