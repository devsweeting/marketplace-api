import { Injectable } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import {
  PortfolioAssetResponse,
  SellOrderAssetApi,
  SellOrderPurchaseAssetApi,
} from './responses/portfolio.response';
import { IPortfolioResponse } from './interfaces/portfolio-response.interface';

export type PortfolioResponseApi = {
  totalValueInCents: number;
  totalUnits: number;
  purchaseHistory: SellOrderPurchaseAssetApi[];
  sellOrderHistory: SellOrderAssetApi[];
};

@Injectable()
export class PortfolioTransformer {
  public constructor(
    private readonly configService: ConfigService,
    private readonly attributeTransformer: AttributeTransformer,
    private readonly mediaTransformer: MediaTransformer,
  ) {}

  public transformSellOrderPurchase(orders): SellOrderPurchaseAssetApi {
    const purchases = orders.map((order) => {
      return {
        ...order,
        updatedAt: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        asset: this.transformAsset(order.asset),
      };
    });
    return purchases.sort(function (a, b) {
      return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
    });
  }

  public transformSellOrder(orders): SellOrderAssetApi {
    const sellOrders = orders.map((order) => {
      return {
        ...order,
        updatedAt: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        startTime: order.startTime.toISOString(),
        expireTime: order.expireTime.toISOString(),
        asset: this.transformAsset(order.asset),
      };
    });
    return sellOrders.sort(function (a, b) {
      return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
    });
  }

  public transformAsset(asset: Asset): PortfolioAssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      media: asset.media?.length ? this.mediaTransformer.transformAll(asset?.media) : null,
      refId: asset.refId,
      slug: asset.slug,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      attributes: this.attributeTransformer.transformAll(asset.attributes),
      partner: encodeHashId(asset.partnerId, this.configService.get('common.default.hashIdSalt')),
    };
  }

  public transformPortfolio(portfolio: IPortfolioResponse) {
    return {
      ...portfolio,
      purchaseHistory: this.transformSellOrderPurchase(portfolio.purchaseHistory),
      sellOrderHistory: this.transformSellOrder(portfolio.sellOrderHistory),
    };
  }
}
