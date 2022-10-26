import { Asset } from 'modules/assets/entities';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

export interface IPortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  paginatedOwnedAssets: Pagination<Asset, IPaginationMeta>;
}
