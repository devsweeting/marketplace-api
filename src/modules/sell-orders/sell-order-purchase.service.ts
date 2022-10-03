import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { User } from 'modules/users/entities';
import { SellOrder, SellOrderPurchase } from './entities';

@Injectable()
export class SellOrdersPurchaseService extends BaseService {
  public async getUserPurchases(user: User): Promise<SellOrderPurchase[]> {
    return (await SellOrderPurchase.getUserPurchases(user)).getMany();
  }

  async getUserTransactions(user: User): Promise<any> {
    const sellOrderHistory = await SellOrder.createQueryBuilder('sellOrder')
      .leftJoinAndMapOne('sellOrder.asset', 'sellOrder.asset', 'asset')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .where('sellOrder.userId = :userId', {
        userId: user.id,
      })
      .andWhere('sellOrder.isDeleted = :isDeleted AND sellOrder.deletedAt IS NULL', {
        isDeleted: false,
      })
      .getMany();

    return { sellOrderHistory };
  }

  async getTotalPurchased(user: User): Promise<any> {
    const { totalValueInCents } = await SellOrderPurchase.createQueryBuilder('SellOrderPurchase')
      .where('SellOrderPurchase.userId = :userId', {
        userId: user.id,
      })
      .select(
        'SUM(SellOrderPurchase.fractionQty * SellOrderPurchase.fractionPriceCents)',
        'totalValueInCents',
      )
      .getRawOne();

    const { totalUnits } = await SellOrderPurchase.createQueryBuilder('SellOrderPurchase')
      .where('SellOrderPurchase.userId = :userId', {
        userId: user.id,
      })
      .select('SUM(SellOrderPurchase.fractionQty)', 'totalUnits')
      .getRawOne();

    return { totalValueInCents: Number(totalValueInCents), totalUnits: Number(totalUnits) };
  }
}
