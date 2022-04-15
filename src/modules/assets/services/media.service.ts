import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner } from 'modules/partners/entities';
import { StorageService } from 'modules/storage/storage.service';
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

  public async getAsset(partner: Partner, id: string): Promise<Asset> {
    const asset = await Asset.findOne(id, {
      where: { partnerId: partner.id },
      relations: ['medias'],
    });
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
    if (asset.medias.length > this.configService.get('asset.default.maxMediaNumber')) {
      throw new AssetMaxMediaOverLimitException();
    }
    if (isOrderExists) {
      throw new OrderIsNotUniqueException();
    }

    const newMedia = new Media({ ...dto, assetId: asset.id });
    await newMedia.save();
    if (dto.type === MediaTypeEnum.Image) {
      const getMedia = await this.getMedia(newMedia.id);
      const file = await this.storageService.uploadFromUrl(dto.url, `assets/media/${asset.id}`);

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
        assetId: asset.id,
        sortOrder: dto.sortOrder,
        isDeleted: false,
        deletedAt: null,
      },
    });
    if (asset.medias.length > this.configService.get('asset.default.maxMediaNumber')) {
      throw new AssetMaxMediaOverLimitException();
    }
    if (isOrderExists && media.id !== isOrderExists.id) {
      throw new OrderIsNotUniqueException();
    }

    const data = { ...dto };
    if (dto.type === MediaTypeEnum.Image && dto.url) {
      const file = await this.storageService.uploadFromUrl(
        dto.url,
        `assets/media/${media.assetId}`,
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
    const mediaData = await Promise.all(
      data.map(async (el, index) => {
        const file =
          el.type === MediaTypeEnum.Image
            ? await this.storageService.uploadFromUrl(el.url, `assets/media/${assetId}`)
            : null;
        return { ...el, sortOrder: index, assetId: assetId, fileId: file?.id };
      }),
    );
    await Media.createQueryBuilder('media').insert().into(Media).values(mediaData).execute();
    return Media.find({ where: { assetId, isDeleted: false } });
  }
}
