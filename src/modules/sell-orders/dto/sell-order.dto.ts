import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class SellOrderDto {
  @ApiProperty()
  @IsUUID(4)
  public userId: string;

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
  @Transform(({ value }) => parseInt(value, 10))
  @Min(new Date().getTime())
  public expireTime: number;
}
