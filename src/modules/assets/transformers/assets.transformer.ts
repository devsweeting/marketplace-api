import { Asset } from '../entities';
import { Injectable } from '@nestjs/common';
import { AssetResponse } from '../interfaces/response/asset.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { StorageService } from 'modules/storage/storage.service';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';

@Injectable()
export class AssetsTransformer {
  public constructor(
    private readonly storageService: StorageService,
    private readonly attributeTransformer: AttributeTransformer,
  ) {}

  public transform(asset: Asset): AssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      image: asset.image ? this.storageService.getUrl(asset.image) : null,
      refId: asset.refId,
      slug: asset.slug,
      externalUrl: asset.externalUrl,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      listing: {
        marketplace: asset.marketplace,
        auctionType: asset.auctionType,
      },
      attributes: this.attributeTransformer.transformAll(asset.attributes || []),
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
