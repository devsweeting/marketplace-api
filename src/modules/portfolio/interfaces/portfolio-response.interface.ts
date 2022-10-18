import { Asset } from 'modules/assets/entities';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

export interface IPortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  paginatedOwnedAssets: Pagination<Asset, IPaginationMeta>;
}
