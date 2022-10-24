import { Injectable } from '@nestjs/common';
import { IPortfolioResponse } from '../interfaces/portfolio-response.interface';
import { WatchlistAssetResponse } from 'modules/watchlists/responses/watchlist.response';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';

export type SellOrderPurchaseAssetApi =
  | Array<SellOrderPurchase & { asset: WatchlistAssetResponse }>
  | [];

export type SellOrderAssetApi = Array<SellOrder & { asset: WatchlistAssetResponse }> | [];

@Injectable()
export class PortfolioTransformer {
  public constructor(private readonly assetsTransformer: AssetsTransformer) {}

  public transformPortfolio(portfolio: IPortfolioResponse) {
    return {
      totalValueInCents: portfolio.totalValueInCents,
      totalUnits: portfolio.totalUnits,
      ...this.assetsTransformer.transformPaginated(portfolio.paginatedOwnedAssets),
    };
  }
}
