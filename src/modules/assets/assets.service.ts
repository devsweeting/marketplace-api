import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { AssetsDuplicatedException } from 'modules/assets/exceptions/assets-duplicated.exception';
import { Asset, Attribute } from './entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';

@Injectable()
export class AssetsService {
  public getList(params: ListAssetsDto): Promise<Pagination<Asset>> {
    return paginate<Asset, IPaginationMeta>(Asset.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async deleteAsset(partner: Partner, id: string): Promise<void> {
    const asset = await Asset.findOne({ where: { id, isDeleted: false } });
    if (!asset || asset.partnerId !== partner.id) {
      throw new AssetNotFoundException();
    }
    Object.assign(asset, { isDeleted: true, deletedAt: new Date() });
    await asset.save();

    await Attribute.update({ assetId: asset.id }, { isDeleted: true, deletedAt: new Date() });
  }

  public async recordTransferRequest(partnerId: string, dto: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne({ where: { partnerId, isDeleted: false } });

    Logger.log(`Partner ${partner.name} received transfer request`);

    const duplicatedAssetsBySlug = await Asset.findDuplicatedBySlugs(
      dto.assets.map((asset) => generateSlug(asset.name)),
    );

    if (duplicatedAssetsBySlug.length) {
      throw new AssetsDuplicatedException(duplicatedAssetsBySlug.map((asset) => asset.name));
    }

    await Asset.saveAssetsForPartner(dto.assets, partner);
  }
}
