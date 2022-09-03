import { InternalServerErrorException } from '@nestjs/common';
import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  RelationId,
  getConnection,
  EntityManager,
} from 'typeorm';
import { SellOrderIdDto, SellOrderPurchaseDto } from '../dto';
import { SellOrderTypeEnum } from '../enums/sell-order-type.enum';
import {
  SellOrderNotFoundException,
  NotEnoughAvailableException,
  PriceMismatchException,
  UserCannotPurchaseOwnOrderException,
  PurchaseLimitReached,
} from '../exceptions';
import { SellOrder } from './sell-orders.entity';

@Entity('sell_order_purchases')
export class SellOrderPurchase extends BaseModel implements BaseEntityInterface {
  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrderPurchase: SellOrderPurchase) => sellOrderPurchase.sellOrder)
  public sellOrderId: string;

  @ManyToOne(() => SellOrder)
  @JoinColumn({ name: 'sellOrderId' })
  public sellOrder: SellOrder;

  @Column({ type: 'string', nullable: true })
  @RelationId((sellOrderPurchase: SellOrderPurchase) => sellOrderPurchase.user)
  public userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'int', nullable: false })
  public fractionQty: number;

  @Column({ type: 'int', nullable: false })
  public fractionPriceCents: number;

  static async from(
    user: User,
    idDto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto,
  ): Promise<SellOrderPurchase> {
    const now = new Date();
    const purchase = await getConnection().transaction(async (manager) => {
      const sellOrder = await manager.findOne(SellOrder, {
        where: { id: idDto.id, isDeleted: false },
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
      const purchase = new SellOrderPurchase({
        userId: user.id,
        sellOrderId: sellOrder.id,
        fractionQty: purchaseDto.fractionsToPurchase,
        fractionPriceCents: purchaseDto.fractionPriceCents,
      });
      sellOrder.fractionQtyAvailable -= purchaseDto.fractionsToPurchase;
      await Promise.all([manager.save(purchase), manager.save(sellOrder)]);
      return purchase;
    });
    return purchase;
  }

  private constructor(partial: Partial<SellOrderPurchase>) {
    super();
    Object.assign(this, partial);
  }

  static async getTotalPurchased(
    user: User,
    order: SellOrder,
    manager: EntityManager = getConnection().manager,
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
}
