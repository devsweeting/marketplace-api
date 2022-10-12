import { InternalServerErrorException } from '@nestjs/common';
import { Asset } from 'modules/assets/entities';
import { AssetNotFoundException } from 'modules/assets/exceptions';
import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  RelationId,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm';
import { SellOrderIdDto, SellOrderPurchaseDto } from '../dto';
import { SellOrderTypeEnum } from '../enums/sell-order-type.enum';
import {
  SellOrderNotFoundException,
  NotEnoughAvailableException,
  PriceMismatchException,
  UserCannotPurchaseOwnOrderException,
  PurchaseLimitReached,
  InvalidSeller,
  NotEnoughUnitsFromSeller,
} from '../exceptions';
import { SellOrder } from './sell-orders.entity';

@Entity('sell_order_purchases')
export class SellOrderPurchase extends BaseModel implements IBaseEntity {
  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrderPurchase: SellOrderPurchase) => sellOrderPurchase.sellOrder)
  public sellOrderId: string;

  @ManyToOne(() => SellOrder)
  @JoinColumn({ name: 'sellOrderId' })
  public sellOrder: SellOrder;

  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrderPurchase: SellOrderPurchase) => sellOrderPurchase.user)
  public userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'int', nullable: false })
  public fractionQty: number;

  @Column({ type: 'int', nullable: false })
  public fractionPriceCents: number;

  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrderPurchase: SellOrderPurchase) => sellOrderPurchase.asset)
  public assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'assetId' })
  public asset?: Asset;

  static async from(
    user: User,
    idDto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto,
  ): Promise<SellOrderPurchase> {
    //TODO get the user_asset that corresponds to a specific user based on the sellorder user and asset information
    //TODO remove the amount of assets that are being bought from that specific user.
    //TODO add the amount removed from the user selling the asset to the user buying the asset.
    //TODO remove the amount from the sellorder
    const now = new Date();
    const purchase = await this.getRepository().manager.transaction(async (manager) => {
      const sellOrder = await manager.findOne(SellOrder, {
        where: { id: idDto.id, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });
      const sellerAsset = await manager.findOne(UserAsset, {
        where: { userId: sellOrder.userId, assetId: sellOrder.assetId, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });
      let buyerAsset = await manager.findOne(UserAsset, {
        where: { userId: user.id, assetId: sellOrder.assetId, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });
      if (!sellOrder) {
        throw new SellOrderNotFoundException();
      }
      if (sellOrder.fractionQtyAvailable < purchaseDto.fractionsToPurchase) {
        throw new NotEnoughAvailableException();
      }
      if (Number(sellOrder.fractionPriceCents) !== Number(purchaseDto.fractionPriceCents)) {
        throw new PriceMismatchException();
      }
      if (sellOrder.userId === user.id) {
        throw new UserCannotPurchaseOwnOrderException();
      }
      if (sellOrder.startTime > now) {
        throw new SellOrderNotFoundException();
      }
      if (sellOrder.expireTime < now) {
        throw new SellOrderNotFoundException();
      }

      if (!sellOrder.type) {
        throw new InternalServerErrorException('Sell order type is not set');
      }

      if (!sellOrder.assetId) {
        throw new AssetNotFoundException();
      }
      if (sellOrder.type === SellOrderTypeEnum.drop) {
        if (!sellOrder.userFractionLimit) {
          throw new InternalServerErrorException('User fraction limit is not set');
        }
        if (!sellOrder.userFractionLimitEndTime) {
          throw new InternalServerErrorException('User fraction limit end time is not set');
        }
        if (now < sellOrder.userFractionLimitEndTime) {
          const userLimit = Number(sellOrder.userFractionLimit);
          if (purchaseDto.fractionsToPurchase > userLimit) {
            throw new PurchaseLimitReached();
          }

          const totalPurchased = await this.getTotalPurchased(user, sellOrder, manager);
          if (totalPurchased + purchaseDto.fractionsToPurchase > userLimit) {
            throw new PurchaseLimitReached();
          }
        }
      }

      if (!sellerAsset) {
        throw new InvalidSeller();
      }
      if (sellerAsset.quantityOwned < purchaseDto.fractionsToPurchase) {
        // Theoretically this should never be the case, unless there is a mismatch between the sellorder data and the user_asset table.
        // User assets should always be equal of greater than the sellorder data from that specific user.
        throw new NotEnoughUnitsFromSeller();
      }
      if (!buyerAsset) {
        // Buyer doesn't already own part of this asset, so we need to add them to the table.
        buyerAsset = new UserAsset({
          assetId: sellOrder.assetId,
          userId: user.id,
          quantityOwned: purchaseDto.fractionsToPurchase,
        });
      }
      const purchase = new SellOrderPurchase({
        userId: user.id,
        sellOrderId: sellOrder.id,
        assetId: sellOrder.assetId,
        fractionQty: purchaseDto.fractionsToPurchase,
        fractionPriceCents: purchaseDto.fractionPriceCents,
      });
      sellOrder.fractionQtyAvailable -= purchaseDto.fractionsToPurchase;
      sellerAsset.quantityOwned -= purchaseDto.fractionsToPurchase;
      buyerAsset.quantityOwned += purchaseDto.fractionsToPurchase;
      await Promise.all([
        manager.save(purchase),
        manager.save(sellOrder),
        manager.save(buyerAsset),
        manager.save(sellerAsset),
      ]);
      return purchase;
    });
    return purchase;
  }

  public constructor(partial: Partial<SellOrderPurchase> = {}) {
    super();
    Object.assign(this, partial);
  }

  static async getTotalPurchased(
    user: User,
    order: SellOrder,
    manager: EntityManager = this.getRepository().manager,
  ): Promise<number> {
    const query = await manager
      .createQueryBuilder(SellOrderPurchase, 'sellOrderPurchase')
      .select('sum(sellOrderPurchase.fractionQty)', 'total_purchased')
      .where('sellOrderPurchase.userId = :userId', { userId: user.id })
      .andWhere('sellOrderPurchase.sellOrderId = :sellOrderId', {
        sellOrderId: order.id,
      });
    return (await query.getRawOne()).total_purchased || 0;
  }

  static async getUserPurchases(user: User): Promise<SelectQueryBuilder<SellOrderPurchase>> {
    //get all user purchases.
    const purchaseHistory = SellOrderPurchase.createQueryBuilder('SellOrderPurchase')
      .leftJoinAndMapOne('SellOrderPurchase.asset', 'SellOrderPurchase.asset', 'asset')
      .leftJoinAndMapMany('asset.labels', 'asset.labels', 'labels')
      .leftJoinAndMapMany('asset.media', 'asset.media', 'media')
      .leftJoinAndMapOne('media.file', 'media.file', 'file')
      .where('SellOrderPurchase.userId = :userId', { userId: user.id });

    return purchaseHistory;
  }
}
