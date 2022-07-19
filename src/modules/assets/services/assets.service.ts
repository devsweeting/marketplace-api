import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute, Label, Media, Token } from 'modules/assets/entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { UpdateAssetDto } from 'modules/assets/dto/update-asset.dto';
import { RefAlreadyTakenException } from 'modules/common/exceptions/ref-already-taken.exception';
import { StorageService } from 'modules/storage/storage.service';
import { Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  AssetNotFoundException,
  AttributeDuplicatedException,
  AssetFilterAttributeOverLimitException,
  AssetFilterLabelOverLimitException,
  AssetSearchOverLimitException,
  PartnerHashIsInvalidException,
} from 'modules/assets/exceptions';
import { MediaService } from './media.service';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { CollectionNotFoundException } from 'modules/collections/exceptions/collection-not-found.exception';
import { decodeHashId } from 'modules/common/helpers/hash-id.helper';
import { validate as isValidUUID } from 'uuid';

@Injectable()
export class AssetsService {
  public constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly mediaService: MediaService,
  ) {}

  public async getList(params: ListAssetsDto): Promise<Pagination<Asset>> {
    if (params.partner) {
      const decodedHash = decodeHashId(
        params.partner,
        this.configService.get('common.default.hashIdSalt'),
      );
      if (!isValidUUID(decodedHash)) {
        throw new PartnerHashIsInvalidException();
      }
    }

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
      params.attr_gte &&
      Object.values(params.attr_gte).filter((item: []) => Array.isArray(item)).length > 0
    ) {
      throw new AttributeDuplicatedException();
    }

    if (
      params.attr_lte &&
      Object.values(params.attr_lte).filter((item: []) => Array.isArray(item)).length > 0
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

    const results = await paginate<Asset, IPaginationMeta>(Asset.list(params, this.configService), {
      page: params.page,
      limit: params.limit,
    });
    const assetIds = results.items.map((el) => el.id);
    const relations = await this.getRelations(assetIds);

    const items = results.items.map((item: Asset) => {
      const relation = relations.find((el) => el.id === item.id);
      item.attributes = relation.attributes;
      item.labels = relation.labels;
      item.media = relation.media.length > 0 ? [relation.media[0]] : [];
      return item;
    });
    return new Pagination(items, results.meta);
  }

  public async getRelations(ids: string[]): Promise<Asset[]> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.attributes', 'asset.attributes', 'attributes')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .orderBy('media.sortOrder, attributes.trait', 'ASC')
      .andWhereInIds(ids);
    return query.getMany();
  }

  public async getOneByParams({ id, slug }: { id: string; slug: string }): Promise<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.attributes', 'asset.attributes', 'attributes')
      .leftJoinAndMapMany(
        'asset.media',
        'asset.media',
        'media',
        'media.isDeleted = FALSE AND media.deletedAt IS NULL',
      )
      .leftJoinAndMapOne('media.file', 'media.file', 'file')

      .andWhere('asset.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('asset.deletedAt IS NULL')
      .orderBy('media.sortOrder, attributes.trait', 'ASC');

    if (id) {
      query.where('asset.id = :id', { id });
    }
    if (slug) {
      query.where('asset.slug = :slug', { slug });
    }
    const asset = await query.getOne();
    if (!asset) {
      throw new AssetNotFoundException();
    }
    return asset;
  }

  public async updateAsset(partner: Partner, id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await Asset.findOne({
      where: { id, partnerId: partner.id },
    });
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

    const { attributes, media, ...data } = dto;
    if (Array.isArray(attributes)) {
      await asset.saveAttributes(attributes);
    }

    if (media) {
      asset.media = await this.mediaService.createBulkMedia(id, media);
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
    await Media.update({ assetId: asset.id }, { isDeleted: true, deletedAt: new Date() });
  }

  public async recordTransferRequest(partnerId: string, dto: TransferRequestDto): Promise<void> {
    const partner: Partner = await Partner.findOne(partnerId);

    Logger.log(`Partner ${partner.name} received transfer request`);

    await Promise.all(
      dto.assets.map(async (assetDto) => {
        const asset = await Asset.saveAssetForPartner(assetDto, partner);

        if (assetDto.media) {
          asset.media = await this.mediaService.createBulkMedia(asset.id, assetDto.media);
        }
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
      }),
    );
  }
}
