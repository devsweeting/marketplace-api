import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAddressDto {
  @ApiProperty({
    example: '170 St Germain St',
  })
  @IsString()
  @IsNotEmpty()
  public address_street: string;

  @ApiProperty({
    example: 'SF',
  })
  @IsString()
  @IsNotEmpty()
  public address_city: string;

  @ApiProperty({
    example: 'CA',
  })
  @IsString()
  @IsNotEmpty()
  public address_subdivision: string;

  @ApiProperty({
    example: 'US',
  })
  @IsString()
  @IsNotEmpty()
  public address_country_code: string;

  @ApiProperty({
    example: '94404',
  })
  @IsString()
  @IsNotEmpty()
  public address_postal_code: string;
}
