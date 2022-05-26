import { ApiProperty } from '@nestjs/swagger';

export class PartnerResponse {
  @ApiProperty({ example: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Test-Logo.svg' })
  public avatar: string;

  @ApiProperty({ example: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Test-Logo.svg' })
  public logo: string;

  @ApiProperty({ example: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Test-Logo.svg' })
  public banner: string;
}
