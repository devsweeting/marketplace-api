import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { AssetsDuplicatedException } from 'modules/assets/exceptions/assets-duplicated.exception';
import { Asset } from './entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';
import { UpdateAssetDto } from 'modules/assets/dto/update-asset.dto';
import { RefAlreadyTakenException } from 'modules/common/exceptions/ref-already-taken.exception';
import { NameAlreadyTakenException } from 'modules/common/exceptions/name-already-taken.exception';
import { Not } from 'typeorm';

@Injectable()
export class AssetsService {
  public getList(params: ListAssetsDto): Promise<Pagination<Asset>> {
    return paginate<Asset, IPaginationMeta>(Asset.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async updateAsset(partner: Partner, id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await Asset.findOne({ where: { id, partnerId: partner.id } });
    if (!asset) {
      throw new AssetNotFoundException();
    }

    if (dto.refId) {
      const assetByRefId = await Asset.findOne({
        where: {
          id: Not(asset.id),
          partnerId: partner.id,
          refId: dto.refId,
        },
      });
      if (assetByRefId) {
        throw new RefAlreadyTakenException();
      }
    }

    if (dto.name) {
      const assetBySlug = await Asset.findOne({
        where: {
          id: Not(asset.id),
          slug: generateSlug(dto.name),
        },
      });
      if (assetBySlug) {
        throw new NameAlreadyTakenException();
      }
    }

    const { attributes, listing, ...data } = dto;
    if (Array.isArray(attributes)) {
      await asset.saveAttributes(attributes);
    }

    if (listing) {
      Object.assign(asset, listing);
    }

    Object.assign(asset, data);

    return asset.save();
  }

  public async deleteAsset(partner: Partner, id: string): Promise<void> {
    const asset = await Asset.findOne(id, { relations: ['attributes'] });
    if (!asset || asset.partnerId !== partner.id) {
      throw new AssetNotFoundException();
    }
    await asset.softRemove();
  }

  public async recordTransferRequest(partnerId: string, dto: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne(partnerId);

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
