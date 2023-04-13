/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { Max, Min, ValidateNested } from 'class-validator';
import { StripePurchaseDetailsDto } from './sell-order-stripe-tracking.dto';
import { Type } from 'class-transformer';

export class SellOrderPurchaseDto {
  @ApiProperty()
  @Min(1)
  @Max(100000000)
  public fractionsToPurchase: number;

  @ApiProperty()
  @Min(1)
  @Max(100000000)
  public fractionPriceCents: number;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => StripePurchaseDetailsDto)
  public stripeTrackingDetails: StripePurchaseDetailsDto;
}
