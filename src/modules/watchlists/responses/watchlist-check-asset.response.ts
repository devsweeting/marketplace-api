import { ApiProperty } from '@nestjs/swagger';

export class WatchlistCheckAssetResponse {
  @ApiProperty({ example: '5c2481c4-c622-48a3-ae6d-657097c3d5e7' })
  public assetId: string;

  @ApiProperty({ example: true })
  public inWatchlist: boolean;
}
