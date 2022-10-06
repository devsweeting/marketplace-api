import { Injectable } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { PortfolioResponse } from './interfaces/portfolio-response.interface';
import {
  IPortfolioResponseAPI,
  PortfolioAssetResponse,
  SellOrderAssetApi,
  SellOrderPurchaseAssetApi,
} from './responses/portfolio.response';

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
    const history = [];
    for (const order of orders) {
      const item = Object.assign(order, {
        updatedAt: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        asset: this.transformAsset(order.asset),
      });
      history.push(item);
    }
    return history ?? [];
  }

  public transformSellOrder(orders): SellOrderAssetApi {
    const history = [];
    for (const order of orders) {
      const item = Object.assign(order, {
        updatedAt: order.updatedAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        startTime: order.startTime.toISOString(),
        expireTime: order.expireTime.toISOString(),
        asset: this.transformAsset(order.asset),
      });
      history.push(item);
    }
    return history ?? [];
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

  public transformPortfolio(portfolio: PortfolioResponse): IPortfolioResponseAPI {
    return Object.assign(portfolio, {
      purchaseHistory: this.transformSellOrderPurchase(portfolio.purchaseHistory),
      sellOrderHistory: this.transformSellOrder(portfolio.sellOrderHistory),
    });
  }
}
