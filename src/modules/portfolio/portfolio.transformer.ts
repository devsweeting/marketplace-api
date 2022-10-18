import { Injectable } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { IPortfolioResponse } from './interfaces/portfolio-response.interface';
import { WatchlistAssetResponse } from 'modules/watchlists/responses/watchlist.response';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';

export type PortfolioResponseApi = {
  totalValueInCents: number;
  totalUnits: number;
  purchaseHistory: SellOrderPurchaseAssetApi[];
  sellOrderHistory: SellOrderAssetApi[];
};

export type SellOrderPurchaseAssetApi =
  | Array<SellOrderPurchase & { asset: WatchlistAssetResponse }>
  | [];

export type SellOrderAssetApi = Array<SellOrder & { asset: WatchlistAssetResponse }> | [];

@Injectable()
export class PortfolioTransformer {
  public constructor(
    private readonly configService: ConfigService,
    private readonly attributeTransformer: AttributeTransformer,
    private readonly mediaTransformer: MediaTransformer,
    private readonly sellOrderTransformer: SellOrdersTransformer,
    private readonly assetsTransformer: AssetsTransformer,
  ) {}

  public transformPortfolio(portfolio: IPortfolioResponse) {
    return {
      ...portfolio,
      ownedAssets: this.assetsTransformer.transformAll(portfolio.ownedAssets),
    };
  }
}
