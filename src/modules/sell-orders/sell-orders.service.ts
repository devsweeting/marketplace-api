import { Injectable } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions';
import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';
import { BaseService } from 'modules/common/services';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities';
import { Pagination, paginate, IPaginationMeta } from 'nestjs-typeorm-paginate';
import { ListSellOrderDto, SellOrderDto, SellOrderIdDto, SellOrderPurchaseDto } from './dto';
import { SellOrder, SellOrderPurchase } from './entities';
import { SellOrderTypeEnum } from './enums/sell-order-type.enum';
import {
  InvalidUserFractionLimitEndTimeException,
  InvalidUserFractionLimitException,
  NotEnoughFractionsForSellOrderException,
  PurchaseLimitReached,
  SellOrderNotFoundException,
} from './exceptions';

@Injectable()
export class SellOrdersService extends BaseService {
  public getList(params: ListSellOrderDto): Promise<Pagination<SellOrder>> {
    return paginate<SellOrder, IPaginationMeta>(SellOrder.list(params), {
      page: params.page,
      limit: params.limit,
    });
  }

  public async getOne(dto: SellOrderIdDto, partner?: Partner): Promise<SellOrder> {
    const query = SellOrder.createQueryBuilder('sellOrder')
      .where('sellOrder.id = :id', { id: dto.id })
      .andWhere('sellOrder.isDeleted = :isDeleted AND sellOrder.deletedAt IS NULL', {
        isDeleted: false,
      });

    if (partner) {
      query.andWhere('sellOrder.partnerId = :partnerId', { partnerId: partner.id });
    }

    const sellOrder = await query.getOne();

    if (!sellOrder) {
      throw new SellOrderNotFoundException();
    }
    return sellOrder;
  }

  public async createSellOrder(
    partner: Partner | { id: string },
    dto: SellOrderDto,
  ): Promise<SellOrder> {
    const asset = await Asset.findOneBy({
      id: dto.assetId,
      partnerId: partner.id,
      deletedAt: null,
      isDeleted: false,
    });
    if (!asset) {
      throw new AssetNotFoundException();
    }
    const user = await User.findOneBy({ email: dto.email, deletedAt: null, isDeleted: false });
    if (!user) {
      throw new UserNotFoundException();
    }

    if (asset.fractionQtyTotal < dto.fractionQty) {
      throw new NotEnoughFractionsForSellOrderException();
    }

    if (dto.type === SellOrderTypeEnum.drop) {
      if (!dto.userFractionLimit) {
        throw new InvalidUserFractionLimitException(
          'userFractionLimit is required for `drop` type sell order',
        );
      }

      if (dto.userFractionLimit > dto.fractionQty) {
        throw new InvalidUserFractionLimitException(
          'userFractionLimit must be less than or equal to fractionQty',
        );
      }

      if (!dto.userFractionLimitEndTime) {
        throw new InvalidUserFractionLimitEndTimeException(
          'userFractionLimitEndTime is required for `drop` type sell order',
        );
      }

      if (dto.userFractionLimitEndTime <= dto.startTime) {
        throw new InvalidUserFractionLimitEndTimeException(
          'userFractionLimitEndTime must be greater than startTime',
        );
      }
    }
    const sellOrder = new SellOrder({ partnerId: partner.id, ...dto });
    return sellOrder.save();
  }

  public async checkDrop(user: User, order: SellOrder): Promise<number> {
    const purchased = await SellOrderPurchase.getTotalPurchased(user, order);
    if (order.type === SellOrderTypeEnum.drop && new Date() < order.userFractionLimitEndTime) {
      if (purchased >= order.userFractionLimit) {
        throw new PurchaseLimitReached();
      }
    }
    return purchased;
  }

  public async deleteSellOrder(partner: Partner, dto: SellOrderIdDto): Promise<void> {
    const sellOrder = await this.getOne(dto, partner);
    Object.assign(sellOrder, { isDeleted: true, deletedAt: new Date(), deletedTime: Date.now() });
    await sellOrder.save();
  }

  async purchase(
    user: User,
    dto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto,
  ): Promise<SellOrderPurchase> {
    return SellOrderPurchase.from(user, dto, purchaseDto);
  }

  async getUserSellOrders(user: User): Promise<SellOrder[]> {
    return await SellOrder.createQueryBuilder('sellOrder')
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
  }

  async getAssetsWithUserSellOrders(user: User): Promise<Asset[]> {
    return await Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.sellOrders', 'asset.sellOrders', 'sellOrders')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .where('sellOrders.userId = :userId', {
        userId: user.id,
      })
      .andWhere('sellOrders.isDeleted = :isDeleted AND sellOrders.deletedAt IS NULL', {
        isDeleted: false,
      })

      .getMany();
  }
}
