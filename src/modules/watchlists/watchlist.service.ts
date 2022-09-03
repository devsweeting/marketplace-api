import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions/asset-not-found.exception';
import { User } from 'modules/users/entities/user.entity';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';

import { BaseService } from '../common/services';
import { WatchlistDto, ListWatchlistDto } from './dto';
import { WatchlistAsset } from './entities/watchlist-asset.entity';
import { Watchlist } from './entities/watchlist.entity';
import { WatchlistAssetDuplicatedException } from './exceptions/watchlist-asset-duplicated.exception';
import { WatchlistAssetNotAddedException } from './exceptions/watchlist-asset-not-added.exception';
import { WatchlistAssetOverLimitException } from './exceptions/watchlist-asset-overlimit.exception';
import { WatchlistNotFoundException } from './exceptions/watchlist-not-found.exception';
import { WatchlistCheckAssetResponse } from './responses/watchlist-check-asset.response';

@Injectable()
export class WatchlistService extends BaseService {
  public constructor(private readonly configService: ConfigService) {
    super();
  }

  private async getAsset(id: string): Promise<Asset> {
    const asset = await Asset.findOne({ where: { id, isDeleted: false, deletedAt: null } });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    return asset;
  }
  public async getWatchlist(
    params: ListWatchlistDto,
    user: User,
  ): Promise<Pagination<WatchlistAsset>> {
    const results = await paginate<WatchlistAsset, IPaginationMeta>(Watchlist.list(params, user), {
      page: params.page,
      limit: params.limit,
    });
    const assetIds = results.items.map((el) => el.assetId);
    const relations = await this.getRelations(assetIds);

    const items = results.items.map((item: WatchlistAsset) => {
      const relation = relations.find((el) => el.id === item.id);
      item.asset.labels = relation?.labels || [];
      item.asset.media = relation?.media.length > 0 ? [relation.media[0]] : [];
      return item;
    });
    return new Pagination(items, results.meta);
  }

  public async getRelations(ids: string[]): Promise<Asset[]> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .orderBy('media.sortOrder')
      .andWhereInIds(ids);
    return query.getMany();
  }

  public async checkAssetInWatchlist({
    assetId,
    slug,
    user,
  }: {
    assetId: string;
    slug: string;
    user: User;
  }): Promise<WatchlistCheckAssetResponse> {
    const asset = await Asset.getAssetBySlugOrId(slug, assetId);
    if (!asset) {
      throw new AssetNotFoundException();
    }
    const query = Watchlist.createQueryBuilder('watchlist')
      .leftJoinAndMapMany(
        'watchlist.watchlistAssets',
        'watchlist.watchlistAssets',
        'watchlistAssets',
        'watchlistAssets.isDeleted = FALSE AND watchlistAssets.deletedAt IS NULL',
      )
      .leftJoinAndMapOne('watchlistAssets.asset', 'watchlistAssets.asset', 'asset')
      .where('watchlist.userId = :userId', {
        userId: user.id,
      });

    if (assetId) {
      query.andWhere('asset.id = :assetId', { assetId });
    }
    if (slug) {
      query.andWhere('asset.slug = :slug', { slug });
    }
    const watchlist = await query.getOne();

    return { assetId: asset.id, inWatchlist: !!watchlist };
  }

  public async assignAssetToWatchlist(user: User, dto: WatchlistDto) {
    let watchList: Watchlist;

    await this.getAsset(dto.assetId);

    watchList = await Watchlist.createQueryBuilder('watchlist')
      .leftJoinAndMapMany(
        'watchlist.watchlistAssets',
        'watchlist.watchlistAssets',
        'watchlistAssets',
      )
      .where('watchlist.userId = :userId', { userId: user.id })
      .getOne();

    if (!watchList) {
      watchList = Watchlist.create({ userId: user.id });
      await watchList.save();
    }
    const asset = watchList?.watchlistAssets?.find((el) => el.assetId === dto.assetId);
    if (!asset) {
      if (
        watchList?.watchlistAssets?.length + 1 >
        this.configService.get('asset.default.watchlistNumberOfItems')
      ) {
        throw new WatchlistAssetOverLimitException();
      }
      const watchListAsset = WatchlistAsset.create({
        watchlistId: watchList.id,
        assetId: dto.assetId,
      });
      await watchListAsset.save();
    } else {
      if (asset.isDeleted === true && asset.deletedAt !== null) {
        await WatchlistAsset.update({ id: asset.id }, { deletedAt: null, isDeleted: false });
      } else {
        throw new WatchlistAssetDuplicatedException();
      }
    }
    return watchList;
  }

  public async deleteAssetFromWatchlist(user: User, assetId: string): Promise<void> {
    await this.getAsset(assetId);

    const watchList = await Watchlist.createQueryBuilder('watchlist')
      .leftJoinAndMapMany(
        'watchlist.watchlistAssets',
        'watchlist.watchlistAssets',
        'watchlistAssets',
        'watchlistAssets.assetId = :assetId',
        { assetId: assetId },
      )
      .where('watchlist.userId = :userId', { userId: user.id })
      .getOne();
    if (!watchList) {
      throw new WatchlistNotFoundException();
    }

    const asset = watchList.watchlistAssets[0];
    if (!asset) {
      throw new WatchlistAssetNotAddedException();
    }
    await WatchlistAsset.update({ id: asset.id }, { deletedAt: new Date(), isDeleted: true });
  }
}
