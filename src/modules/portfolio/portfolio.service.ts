import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { User } from 'modules/users/entities';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';
import { Asset } from 'modules/assets/entities';

@Injectable()
export class PortfolioService extends BaseService {
  constructor(
    private readonly sellOrderService: SellOrdersService,
    private readonly sellOrderPurchaseService: SellOrdersPurchaseService,
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
