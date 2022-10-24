import { ApiProperty } from '@nestjs/swagger';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

export class PortfolioResponse extends PaginatedResponse<AssetResponse> {
  @ApiProperty({ example: 1000 })
  totalValueInCents: number;
  @ApiProperty({ example: 1 })
  totalUnits: number;
}
