import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class SellOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty()
  @IsUUID(4)
  public assetId: string;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  public fractionQty: number;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(0)
  public fractionPriceCents: number;

  @ApiProperty()
  @IsDateString()
  public expireTime: Date;

  @ApiProperty()
  @IsDateString()
  public startTime: Date;
}
