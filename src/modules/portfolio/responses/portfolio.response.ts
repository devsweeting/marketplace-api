import { ApiProperty } from '@nestjs/swagger';
import { AssetResponse } from 'modules/assets/responses/asset.response';

export class PortfolioResponse {
  @ApiProperty({ example: 1000 })
  totalValueInCents: number;
  @ApiProperty({ example: 1 })
  totalUnits: number;
  @ApiProperty({ type: [AssetResponse], description: 'Assets owned by the user' })
  ownedAssets: AssetResponse[];
}
