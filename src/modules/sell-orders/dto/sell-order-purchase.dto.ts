/* eslint-disable no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { Max, Min } from 'class-validator';

export type IStripePurchaseTracking = {
  intentId: string;
  purchaseStatus: string;
  amount: number;
};

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
  public stripeTrackingDetails?: IStripePurchaseTracking;
}
