import { ApiProperty } from '@nestjs/swagger';

export class UserAssetResponse {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public assetId: string;

  @ApiProperty()
  public quantityOwned: number;
}
