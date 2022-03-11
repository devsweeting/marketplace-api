import { Asset } from '../entities';
import { Injectable } from '@nestjs/common';
import { AssetResponse } from '../interfaces/response/asset.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

@Injectable()
export class AssetsTransformer {
  public transform(asset: Asset): AssetResponse {
    return {
      id: asset.id,
      name: asset.name,
      description: asset.description,
      image: asset.image,
      refId: asset.refId,
      slug: asset.slug,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
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
