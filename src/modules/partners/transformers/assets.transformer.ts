import { Asset } from '../entities';
import { AssetResponse } from 'modules/partners/interfaces/response/asset.response';
import { Injectable } from '@nestjs/common';

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
}
