import { ApiProperty } from '@nestjs/swagger';
import { Max, Min } from 'class-validator';

export class SellOrderPurchaseDto {
  @ApiProperty()
  @Min(1)
  @Max(100000000)
  public fractionsToPurchase: number;

  @ApiProperty()
  @Min(1)
  @Max(100000000)
  public fractionPriceCents: number;
}
