import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute, Label, Token } from './entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';
import { UpdateAssetDto } from 'modules/assets/dto/update-asset.dto';
import { RefAlreadyTakenException } from 'modules/common/exceptions/ref-already-taken.exception';
import { StorageService } from 'modules/storage/storage.service';
import { Not } from 'typeorm';

@Injectable()
export class AssetsService {
  public constructor(private readonly storageService: StorageService) {}

  public async getList(params: ListAssetsDto): Promise<Pagination<Asset>> {
    const results = await paginate<Asset, IPaginationMeta>(Asset.list(params), {
      page: params.page,
      limit: params.limit,
    });

    return new Pagination(
      await Promise.all(
        results.items.map(async (item: Asset) => {
          item.attributes = await Attribute.findAllByAssetId(item.id);

          return item;
        }),
      ),
      results.meta,
    );
  }

  public async getOne(id: string): Promise<Asset> {
    const asset = await Asset.findOne({
      where: { id, isDeleted: false },
      relations: ['attributes', 'image'],
    });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    return asset;
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
          isDeleted: false,
        },
      });
      if (assetByRefId) {
        throw new RefAlreadyTakenException();
      }
    }

    const { attributes, image, ...data } = dto;
    if (Array.isArray(attributes)) {
      await asset.saveAttributes(attributes);
    }

    if (image) {
      asset.image = await this.storageService.uploadFromUrl(image, `assets/${asset.id}`);
    }

    Object.assign(asset, data);

    return asset.save();
  }

  public async deleteAsset(partner: Partner, id: string): Promise<void> {
    const asset = await Asset.findOne({ where: { id, isDeleted: false, partnerId: partner.id } });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    Object.assign(asset, { isDeleted: true, deletedAt: new Date() });
    await asset.save();

    await Token.update({ assetId: asset.id }, { isDeleted: true, deletedAt: new Date() });
    await Attribute.update({ assetId: asset.id }, { isDeleted: true, deletedAt: new Date() });
    await Label.update({ assetId: asset.id }, { isDeleted: true, deletedAt: new Date() });
  }

  public async recordTransferRequest(partnerId: string, dto: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne(partnerId);

    Logger.log(`Partner ${partner.name} received transfer request`);

    await Promise.all(
      dto.assets.map(async (assetDto) => {
        const asset = await Asset.saveAssetForPartner(assetDto, partner);
        if (assetDto.image) {
          asset.image = await this.storageService.uploadFromUrl(
            assetDto.image,
            `assets/${asset.id}`,
          );
          await asset.save();
        }
      }),
    );
  }
}
