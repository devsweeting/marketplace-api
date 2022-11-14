import { ApiProperty } from '@nestjs/swagger';

export class SellOrderResponse {
  @ApiProperty({ example: '1' })
  public id: string;

  @ApiProperty({ example: '1' })
  public assetId: string;

  @ApiProperty({ example: '1' })
  public userId: string;

  @ApiProperty({ example: '1' })
  public partnerId: string;

  @ApiProperty({ example: 1 })
  public fractionQty: number;

  @ApiProperty({ example: 1 })
  public fractionQtyAvailable: number;

  @ApiProperty({ example: 1 })
  public fractionPriceCents: number;

  @ApiProperty({ example: 1657541523785 })
  public expireTime: number;

  @ApiProperty({ example: 1657541523785 })
  public startTime: number;

  @ApiProperty({ example: 1657541523785 })
  public deletedTime: number;

  @ApiProperty({ example: 'standard' })
  public type: string;

  @ApiProperty({ example: 1 })
  public userFractionLimit?: number;

  @ApiProperty({ example: '2023-01-21T14:26:40.548Z' })
  public userFractionLimitEndTime?: Date;
}

export class SellOrderCheckResponse {
  @ApiProperty({ example: 100 })
  fractionsPurchased: number;
  @ApiProperty({ example: 100 })
  fractionsAvailableToPurchase: number;
}
