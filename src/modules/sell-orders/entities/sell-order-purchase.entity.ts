import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities';
import { Column, Entity, JoinColumn, ManyToOne, RelationId, getConnection } from 'typeorm';
import { SellOrderIdDto, SellOrderPurchaseDto } from '../dto';
import {
  SellOrderNotFoundException,
  NotEnoughAvailableException,
  PriceMismatchException,
  UserCannotPurchaseOwnOrderException,
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
    const purchase = await getConnection().transaction(async (manager) => {
      const sellOrder = await manager.findOne(
        SellOrder,
        { id: idDto.id, isDeleted: false },
        {
          lock: { mode: 'pessimistic_write' },
        },
      );
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
      if (sellOrder.startTime > new Date().getTime()) {
        throw new SellOrderNotFoundException();
      }
      if (sellOrder.expireTime < new Date().getTime()) {
        throw new SellOrderNotFoundException();
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
}
