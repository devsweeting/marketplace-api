import { ApiProperty } from '@nestjs/swagger';

export class SellOrderPurchaseResponse {
  @ApiProperty({ example: '1' })
  public id: string;

  @ApiProperty({ example: '2022-11-11T21:06:14.059Z' })
  public updatedAt: Date;

  @ApiProperty({ example: '2022-11-11T21:06:14.059Z' })
  public createdAt: Date;

  @ApiProperty({ example: '2022-11-11T21:06:14.059Z' })
  public deletedAt: Date;

  @ApiProperty({ example: false })
  public isDeleted: boolean;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  public sellOrderId: string;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  public userId: string;

  @ApiProperty({ example: 1 })
  public fractionQty: number;

  @ApiProperty({ example: 1 })
  public fractionPriceCents: number;

  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  public assetId: string;
}
