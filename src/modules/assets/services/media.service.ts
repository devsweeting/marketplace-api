import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner } from 'modules/partners/entities';
import { StorageService } from 'modules/storage/storage.service';
import { Not } from 'typeorm';
import { MediaDto } from '../dto/media/media.dto';
import { UpdateMediaDto } from '../dto/media/update-media.dto';
import { Asset, Media } from '../entities';
import { MediaTypeEnum } from '../enums/media-type.enum';
import { AssetMaxMediaOverLimitException } from '../exceptions/asset-max-media-over-limit.exception';
import { AssetNotFoundException } from '../exceptions/asset-not-found.exception';
import { MediaNotFoundException } from '../exceptions/media-not-found.exception';
import { OrderIsNotUniqueException } from '../exceptions/order-is-not-unique.exception';

@Injectable()
export class MediaService {
  public constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  public async getMedia(id: string): Promise<Media> {
    const media = await Media.findOne({
      where: { id, isDeleted: false, deletedAt: null },
    });
    if (!media) {
      throw new MediaNotFoundException();
    }
    return media;
  }

  public async getMediaListForAsset(assetId: string): Promise<Media[]> {
    const media = await Media.find({
      where: { assetId, isDeleted: false, deletedAt: null },
    });
    return media;
  }

  public async getAsset(partner: Partner, id: string): Promise<Asset> {
    const asset = await Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany(
        'asset.media',
        'asset.media',
        'media',
        'media.isDeleted = FALSE AND media.deletedAt IS NULL',
      )
      .where('asset.id = :id', { id: id })
      .andWhere('asset.partnerId = :partnerId', { partnerId: partner.id })
      .getOne();
    if (!asset) {
      throw new AssetNotFoundException();
    }
    return asset;
  }

  public async createMedia(partner: Partner, assetId: string, dto: MediaDto): Promise<Media> {
    const asset = await this.getAsset(partner, assetId);

    const isOrderExists = await Media.findOne({
      where: { assetId: asset.id, sortOrder: dto.sortOrder, isDeleted: false, deletedAt: null },
    });
    if (asset.media.length > this.configService.get('asset.default.maxMediaNumber')) {
      throw new AssetMaxMediaOverLimitException();
    }
    if (isOrderExists) {
      throw new OrderIsNotUniqueException();
    }

    const newMedia = new Media({ ...dto, assetId: asset.id });
    await newMedia.save();
    if (dto.type === MediaTypeEnum.Image) {
      const getMedia = await this.getMedia(newMedia.id);
      const [file] = await this.storageService.uploadFromUrls([{ ...dto }], `assets/${asset.id}`);
      Object.assign(getMedia, { fileId: file.id });
      return getMedia.save();
    }

    return newMedia;
  }

  public async updateMedia(partner: Partner, id: string, dto: UpdateMediaDto): Promise<Media> {
    const media = await this.getMedia(id);
    const asset = await this.getAsset(partner, media.assetId);
    const isOrderExists = await Media.findOne({
      where: {
        id: Not(id),
        assetId: asset.id,
        sortOrder: dto.sortOrder,
        isDeleted: false,
        deletedAt: null,
      },
    });
    if (asset.media.length > this.configService.get('asset.default.maxMediaNumber')) {
      throw new AssetMaxMediaOverLimitException();
    }
    if (isOrderExists && media.id !== isOrderExists.id) {
      throw new OrderIsNotUniqueException();
    }

    const data = { ...dto };
    if (dto.type === MediaTypeEnum.Image && dto.url) {
      const [file] = await this.storageService.uploadFromUrls(
        [{ sourceUrl: dto.url }],
        `assets/${media.assetId}`,
      );

      data['fileId'] = file.id;
    }
    if (dto.type === MediaTypeEnum.Youtube) {
      data['fileId'] = null;
    }

    Object.assign(media, data);

    return media.save();
  }

  public async deleteMedia(partner: Partner, id: string): Promise<void> {
    const media = await this.getMedia(id);
    await this.getAsset(partner, media.assetId);
    Object.assign(media, { isDeleted: true, deletedAt: new Date() });
    await media.save();
  }

  public async createBulkMedia(assetId: string, data: MediaDto[]): Promise<Media[]> {
    await Media.bulkSoftDelete(assetId);
    const urls = data.filter((el) => el.type === MediaTypeEnum.Image);
    const files = await this.storageService.uploadFromUrls(urls, `assets/${assetId}`);
    const mediaData = urls.map((el, index) => {
      return {
        ...el,
        sortOrder: index,
        assetId: assetId,
        file: files[index] ? files[index] : null,
        fileId: files[index]?.id,
      };
    });
    await Media.createQueryBuilder('media').insert().into(Media).values(mediaData).execute();
    return Media.find({ where: { assetId, isDeleted: false } });
  }

  public async detachAssetMedia(assetId: string, mediaIdsToRemove: string[]): Promise<void> {
    await Media.bulkSoftDelete(assetId, mediaIdsToRemove);
  }

  public async bulkUpdateMedia(assetId: string, mediaToUpdate: Partial<Media>[]): Promise<void> {
    await Promise.all(
      mediaToUpdate.map(async (el) => {
        await Media.update({ assetId, id: el.id }, { ...el });
      }),
    );
  }
}
