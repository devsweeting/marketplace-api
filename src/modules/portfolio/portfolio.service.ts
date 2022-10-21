import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';
import { Asset } from 'modules/assets/entities';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { IAssetListArgs } from 'modules/assets/interfaces/IAssetListArgs';
import { AssetsService } from 'modules/assets/services/assets.service';
import { UserAsset } from 'modules/users/entities/user-assets.entity';

@Injectable()
export class PortfolioService extends BaseService {
  constructor(private readonly assetService?: AssetsService) {
    super();
  }

  public async getUserPortfolio(params: IAssetListArgs, user: User): Promise<IPortfolioResponse> {
    const paginatedOwnedAssets = await this.getList(params, user);
    const { totalValueInCents, totalUnits } = await this.getTotalPurchased(user);
    return { totalValueInCents, totalUnits, paginatedOwnedAssets };
  }

  public async getList(
    params: IAssetListArgs,
    user: User,
  ): Promise<Pagination<Asset, IPaginationMeta>> {
    const query = await Asset.createQueryBuilder('asset')
      .leftJoinAndMapOne('asset.userAsset', 'asset.userAsset', 'userAsset')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .where('userAsset.userId = :userId', {
        userId: user.id,
      })
      .andWhere('userAsset.isDeleted = :isDeleted AND userAsset.deletedAt IS NULL', {
        isDeleted: false,
      })
      .addOrderBy(params.sort, params.order);
    //TODO currently the params don't actually work,
    // trying to reuse the asset params query and modifying it to include userAsset doesn't seem to work either,
    // Next steps would probably be to recreate the query code specific for this use case.
    const results = await paginate<Asset, IPaginationMeta>(query, {
      page: params.page,
      limit: params.limit,
    });

    const assetIds = results.items.map((el) => el.id);
    const relations = await this.assetService
      .getRelationsQuery(assetIds)
      .leftJoinAndMapOne('asset.userAsset', 'asset.userAsset', 'userAsset')
      .andWhere('userAsset.userId = :userId', {
        userId: user.id,
      })
      .getMany();
    const items = results.items.map((item: Asset) => {
      const relation = relations.find((el) => el.id === item.id);
      item.labels = relation.labels;
      item.media = relation.media;
      item.sellOrders = relation.sellOrders;
      item.userAsset = relation.userAsset;
      return item;
    });

    return new Pagination(items, results.meta);
  }

  async getUserOwnedAssets(user: User): Promise<Asset[]> {
    return await Asset.createQueryBuilder('asset')
      .leftJoinAndMapOne('asset.userAsset', 'asset.userAsset', 'userAsset')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .where('userAsset.userId = :userId', {
        userId: user.id,
      })
      .andWhere('userAsset.isDeleted = :isDeleted AND userAsset.deletedAt IS NULL', {
        isDeleted: false,
      })
      .getMany();
  }
  async getTotalPurchased(user: User): Promise<any> {
    //TODO this will need to be looked at when we add the ability to have
    //     multiple sell orders active for a specific asset
    const { totalValueInCents } = await Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.sellOrders', 'asset.sellOrders', 'sellOrders')
      .leftJoinAndMapOne('asset.userAsset', 'asset.userAsset', 'userAsset')
      .where('userAsset.userId = :userId', {
        userId: user.id,
      })
      .andWhere('userAsset.isDeleted = :isDeleted AND userAsset.deletedAt IS NULL', {
        isDeleted: false,
      })
      .andWhere('sellOrders.isDeleted = :isDeleted AND sellOrders.deletedAt IS NULL', {
        isDeleted: false,
      })
      .select('SUM(userAsset.quantityOwned * sellOrders.fractionPriceCents)', 'totalValueInCents')
      .getRawOne();

    const { totalUnits } = await UserAsset.createQueryBuilder('userAsset')
      .where('userAsset.userId = :userId', {
        userId: user.id,
      })
      .andWhere('userAsset.isDeleted = :isDeleted AND userAsset.deletedAt IS NULL', {
        isDeleted: false,
      })
      .select('SUM(userAsset.quantityOwned)', 'totalUnits')
      .getRawOne();

    return { totalValueInCents: Number(totalValueInCents), totalUnits: Number(totalUnits) };
  }
}
