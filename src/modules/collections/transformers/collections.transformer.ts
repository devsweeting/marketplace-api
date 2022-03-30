import { Collection } from '../entities';
import { Injectable } from '@nestjs/common';

import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { StorageService } from 'modules/storage/storage.service';
import { CollectionResponse } from '../interfaces/responses/collection.response';
import { Asset } from 'modules/assets/entities/asset.entity';
import { AssetResponse } from 'modules/assets/interfaces/response/asset.response';

@Injectable()
export class CollectionsTransformer {
  public constructor(private readonly storageService: StorageService) {}

  public transform(collection: Collection): CollectionResponse {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      banner: collection.banner ? this.storageService.getUrl(collection.banner) : null,
      slug: collection.slug,
      createdAt: collection.createdAt.toISOString(),
      updatedAt: collection.updatedAt.toISOString(),
      assets: collection.assets ? this.transformAllAssets(collection.assets) : [],
    };
  }

  public transformAll(collections: Collection[]): CollectionResponse[] {
    return collections.map((collection) => this.transform(collection));
  }

  public transformAsset(asset: Asset): AssetResponse {
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
    };
  }

  public transformAllAssets(assets: Asset[]): AssetResponse[] {
    return assets.map((asset) => this.transformAsset(asset));
  }

  public transformPaginated(
    pagination: Pagination<Collection>,
  ): PaginatedResponse<CollectionResponse> {
    return {
      meta: pagination.meta,
      items: this.transformAll(pagination.items),
    };
  }
}
