import { ApiProperty } from '@nestjs/swagger';

export class PartnerDto {
  @ApiProperty({ description: "Partner's name" })
  name: string;
}
