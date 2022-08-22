import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { SellOrderTypeEnum } from '../enums/sell-order-type.enum';

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
  @Min(1)
  public fractionQty: number;

  @ApiProperty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  public fractionPriceCents: number;

  @ApiProperty()
  @IsDateString()
  public expireTime: Date;

  @ApiProperty()
  @IsDateString()
  public startTime: Date;

  @ApiProperty({
    description: 'Sell order type',
    enum: SellOrderTypeEnum,
  })
  @IsEnum(SellOrderTypeEnum)
  @IsOptional()
  public type: SellOrderTypeEnum;

  @ApiProperty({
    description:
      'Number of fractions a user may purchase between `startTime` and `userFractionLimitEndTime`. Only allowed on `drop` type sell orders.',
  })
  @Min(1)
  @Max(1000000000)
  @IsOptional()
  public userFractionLimit?: number;

  @ApiProperty({
    description:
      'Specific time to end per-user fraction limit. Only allowed on `drop` type sell orders.',
  })
  @IsDateString()
  @IsOptional()
  public userFractionLimitEndTime?: Date;
}
