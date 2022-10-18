import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { User } from 'modules/users/entities';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';
import { Asset } from 'modules/assets/entities';
import { IPaginationMeta, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { IAssetListArgs } from 'modules/assets/interfaces/IAssetListArgs';
import { AssetsService } from 'modules/assets/services/assets.service';

@Injectable()
export class PortfolioService extends BaseService {
  constructor(
    private readonly sellOrderService: SellOrdersService,
    private readonly sellOrderPurchaseService: SellOrdersPurchaseService,
    private readonly assetService: AssetsService,
  ) {
    super();
  }

  public async getUserPortfolio(user: User): Promise<IPortfolioResponse> {
    const ownedAssets = await this.getUserOwnedAssets(user);
    const { totalValueInCents, totalUnits } = await this.sellOrderPurchaseService.getTotalPurchased(
      user,
    );
    return { totalValueInCents, totalUnits, ownedAssets };
  }

  // public async getList(params: IAssetListArgs, user: User): Promise<Pagination<Asset>> {
  public async getList(params: IAssetListArgs, user: User) {
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
      });

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

    console.log(new Pagination(items, results.meta));
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
}
