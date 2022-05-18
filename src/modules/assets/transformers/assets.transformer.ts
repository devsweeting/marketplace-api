import { Asset } from '../entities';
import { Injectable } from '@nestjs/common';
import { AssetResponse } from '../interfaces/response/asset.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from './media.transformer';
import { encodeHashId } from 'modules/common/helpers/hash-id.helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AssetsTransformer {
  public constructor(
    private readonly attributeTransformer: AttributeTransformer,
    private readonly mediaTransformer: MediaTransformer,
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
      attributes: this.attributeTransformer.transformAll(asset.attributes || []),
      partner: encodeHashId(
        asset.partnerId,
        this.configService.get('common.default.partnerHashSalt'),
      ),
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
