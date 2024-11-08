import { Asset } from '../entities';
import { Injectable } from '@nestjs/common';
import { AssetResponse } from '../responses/asset.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from './media.transformer';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { ConfigService } from '@nestjs/config';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';
import { UserAssetTransformer } from 'modules/users/transformers/user-asset.transformer';

@Injectable()
export class AssetsTransformer {
  public constructor(
    private readonly attributeTransformer: AttributeTransformer,
    private readonly mediaTransformer: MediaTransformer,
    private readonly sellOrderTransformer: SellOrdersTransformer,
    private readonly userAssetTransformer: UserAssetTransformer,
    private readonly configService: ConfigService,
  ) {}

  public transform(asset: Asset): AssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      media: asset.media?.length ? this.mediaTransformer.transformAll(asset.media) : null,
      refId: asset.refId,
      slug: asset.slug,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      attributes: this.attributeTransformer.transformAll(asset.attributes),
      partner: encodeHashId(asset.partnerId, this.configService.get('common.default.hashIdSalt')),
      sellOrders: asset.sellOrders?.length
        ? this.sellOrderTransformer.transformAll(asset.sellOrders)
        : [],
      userAsset: this.userAssetTransformer.transform(asset.userAsset),
    };
  }

  public transformAll(assets: Asset[]): AssetResponse[] {
    return assets.map((asset) => this.transform(asset));
  }

  public transformPaginated(pagination: Pagination<Asset>): PaginatedResponse<AssetResponse> {
    return {
      meta: pagination.meta,
      items: this.transformAll(pagination.items),
    };
  }
}
