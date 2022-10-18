import { Asset } from 'modules/assets/entities';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

export interface IPortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  ownedAssets: PaginatedResponse<AssetResponse>;
}
