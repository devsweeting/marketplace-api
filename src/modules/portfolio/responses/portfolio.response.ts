import { ApiProperty } from '@nestjs/swagger';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

//TODO update paginatedResponse to somehow include a wrapper so that the type show up in swagger
export class PortfolioResponse extends PaginatedResponse<AssetResponse> {
  @ApiProperty({ example: 1000 })
  totalValueInCents: number;
  @ApiProperty({ example: 1 })
  totalUnits: number;
}
