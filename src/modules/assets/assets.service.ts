import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { AssetsDuplicatedException } from 'modules/assets/exceptions/assets-duplicated.exception';
import { Asset, Attribute, Label, Token } from './entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';
import { UpdateAssetDto } from 'modules/assets/dto/update-asset.dto';
import { RefAlreadyTakenException } from 'modules/common/exceptions/ref-already-taken.exception';
import { StorageService } from 'modules/storage/storage.service';
import { Not } from 'typeorm';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { CollectionNotFoundException } from 'modules/collections/exceptions/collection-not-found.exception';
import { ConfigService } from '@nestjs/config';
import { AssetSearchOverLimitException } from './exceptions/asset-search-over-limit.exception';
import { AssetFilterLabelOverLimitException } from './exceptions/asset-filter-label-over-limit.exception';
import { AssetFilterAttributeOverLimitException } from './exceptions/asset-filter-attribute-over-limit.exception';
import { AttributeDuplicatedException } from './exceptions/attribute-filter-duplicate.exception';

@Injectable()
export class AssetsService {
  public constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  public async getList(params: ListAssetsDto): Promise<Pagination<Asset>> {
    if (params?.search?.length > this.configService.get('asset.default.searchMaxNumber')) {
      throw new AssetSearchOverLimitException();
    }
    if (
      params.label_eq &&
      Object.keys(params.label_eq).length >
        this.configService.get('asset.default.filterLabelMaxNumber')
    ) {
      throw new AssetFilterLabelOverLimitException();
    }
    if (
      params.attr_eq &&
      Object.keys(params.attr_eq).length >
        this.configService.get('asset.default.filterAttributeMaxNumber')
    ) {
      throw new AssetFilterAttributeOverLimitException();
    }

    if (
      params.attr_eq &&
      Object.keys(params.attr_eq).filter(
        (item, index) => Object.keys(params.attr_eq).indexOf(item) !== index,
      ).length > 0
    ) {
      throw new AttributeDuplicatedException();
    }

    if (
      params.attr_eq &&
      params.attr_gte &&
      Object.keys(params.attr_eq).filter((value) => Object.keys(params.attr_gte).includes(value))
        .length > 0
    ) {
      throw new AttributeDuplicatedException();
    }

    if (
      params.attr_eq &&
      params.attr_lte &&
      Object.keys(params.attr_eq).filter((value) => Object.keys(params.attr_lte).includes(value))
        .length > 0
    ) {
      throw new AttributeDuplicatedException();
    }

    const results = await paginate<Asset, IPaginationMeta>(Asset.list(params), {
      page: params.page,
      limit: params.limit,
    });

    return new Pagination(
      await Promise.all(
        results.items.map(async (item: Asset) => {
          item.attributes = await Attribute.findAllByAssetId(item.id);
          item.labels = await Label.findAllByAssetId(item.id);
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

    const { attributes, listing, image, ...data } = dto;
    if (Array.isArray(attributes)) {
      await asset.saveAttributes(attributes);
    }

    if (image) {
      asset.image = await this.storageService.uploadFromUrl(image, `assets/${asset.id}`);
    }

    if (listing) {
      Object.assign(asset, listing);
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

    const duplicatedAssetsByRefIds = await Asset.findDuplicatedByRefIds(
      partnerId,
      dto.assets.map((asset) => asset.refId),
    );

    if (duplicatedAssetsByRefIds.length) {
      throw new AssetsDuplicatedException(duplicatedAssetsByRefIds.map((asset) => asset.refId));
    }

    await Promise.all(
      dto.assets.map(async (assetDto) => {
        const asset = await Asset.saveAssetForPartner(assetDto, partner);
        if (assetDto.image) {
          asset.image = await this.storageService.uploadFromUrl(
            assetDto.image,
            `assets/${asset.id}`,
          );
          if (assetDto.collection) {
            const collection = assetDto.collection.id
              ? await Collection.findOne(assetDto.collection.id)
              : await Collection.findOne({ where: { slug: assetDto.collection.id } });
            if (!collection) {
              throw new CollectionNotFoundException();
            }
            const collectionAsset = CollectionAsset.create({
              collectionId: collection.id,
              assetId: asset.id,
            });
            await collectionAsset.save();
          }
          await asset.save();
        }
      }),
    );
  }
}
