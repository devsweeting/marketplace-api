import { Injectable } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions';
import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities';
import { Pagination, paginate, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { ListSellOrderDto, SellOrderDto } from './dto';
import { SellOrder } from './entities';
import { SellOrderNotFoundException } from './exceptions';

@Injectable()
export class SellOrdersService {
  public getList(params: ListSellOrderDto): Promise<Pagination<SellOrder>> {
    return paginate<SellOrder, IPaginationMeta>(SellOrder.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async getOne(partner: Partner, id: string): Promise<SellOrder> {
    const query = SellOrder.createQueryBuilder('sellOrder')
      .where('sellOrder.id = :id AND sellOrder.partnerId = :partnerId', {
        id,
        partnerId: partner.id,
      })
      .andWhere('sellOrder.isDeleted = :isDeleted AND sellOrder.deletedAt IS NULL', {
        isDeleted: false,
      });

    const sellOrder = await query.getOne();

    if (!sellOrder) {
      throw new SellOrderNotFoundException();
    }
    return sellOrder;
  }

  public async createSellOrder(partner, dto: SellOrderDto): Promise<SellOrder> {
    const asset = await Asset.findOne({
      id: dto.assetId,
      partnerId: partner.id,
      deletedAt: null,
      isDeleted: false,
    });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    const user = await User.findOne({ id: dto.userId, deletedAt: null, isDeleted: false });
    if (!user) {
      throw new UserNotFoundException();
    }
    const sellOrder = new SellOrder({ partnerId: partner.id, ...dto });
    return sellOrder.save();
  }

  public async deleteSellOrder(partner: Partner, id: string): Promise<void> {
    const sellOrder = await this.getOne(partner, id);
    Object.assign(sellOrder, { isDeleted: true, deletedAt: new Date(), deletedTime: Date.now() });
    await sellOrder.save();
  }
}
