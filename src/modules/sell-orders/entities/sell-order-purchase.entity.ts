import { HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';
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
  NotEnoughUnitsFromSeller,
  SellerNotAssetOwnerException,
} from '../exceptions';
import { SellOrder } from './sell-orders.entity';
import { SellOrderPurchaseValidateResponse } from '../responses/sell-order.response';
import { SellOrderValidateDto } from '../dto/sell-order-validate.dto';

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

  @Column({ nullable: true })
  public stripePurchaseIntentId: string | null;

  @Column({ nullable: true })
  public stripePurchaseStatus: string | null;

  @Column({ type: 'int', nullable: true })
  public stripeAmountCharged: number | null;

  static async runPurchaseValidations(
    user: User,
    idDto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto | SellOrderValidateDto,
    manager: EntityManager = this.getRepository().manager,
  ): Promise<{ sellOrder: SellOrder; sellerAsset: UserAsset }> {
    const now = new Date();

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

    const sellerAsset = await manager.findOne(UserAsset, {
      where: { userId: sellOrder.userId, assetId: sellOrder.assetId, isDeleted: false },
      lock: { mode: 'pessimistic_write' },
    });
    if (!sellerAsset) {
      throw new SellerNotAssetOwnerException();
    }
    if (sellerAsset.quantityOwned < purchaseDto.fractionsToPurchase) {
      throw new NotEnoughUnitsFromSeller();
    }
    return { sellOrder, sellerAsset };
  }

  static async validate(
    user: User,
    idDto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto | SellOrderValidateDto,
  ): Promise<SellOrderPurchaseValidateResponse> {
    const purchaseValidation = await this.getRepository().manager.transaction(async (manager) => {
      const { sellOrder, sellerAsset } = await this.runPurchaseValidations(
        user,
        idDto,
        purchaseDto,
        manager,
      );
      if (sellOrder && sellerAsset) {
        return { statusCode: HttpStatus.OK, error: null, message: 'Passed Validations' };
      }
    });
    return purchaseValidation;
  }

  static async from(
    user: User,
    idDto: SellOrderIdDto,
    purchaseDto: SellOrderPurchaseDto,
  ): Promise<SellOrderPurchase> {
    const purchase = await this.getRepository().manager.transaction(async (manager) => {
      const { sellOrder, sellerAsset } = await this.runPurchaseValidations(
        user,
        idDto,
        purchaseDto,
        manager,
      );

      let buyerAsset = await manager.findOne(UserAsset, {
        where: { userId: user.id, assetId: sellOrder.assetId, isDeleted: false },
        lock: { mode: 'pessimistic_write' },
      });

      if (!buyerAsset) {
        buyerAsset = new UserAsset({
          assetId: sellOrder.assetId,
          userId: user.id,
          quantityOwned: 0,
        });
      }

      //If Stripe Details are prvided, save them in the sell order purchase
      const stripeTrackingDetails = purchaseDto.stripeTrackingDetails
        ? {
            stripePurchaseIntentId: purchaseDto.stripeTrackingDetails.intentId,
            stripePurchaseStatus: purchaseDto.stripeTrackingDetails.purchaseStatus,
            stripeAmountCharged: purchaseDto.stripeTrackingDetails.amount,
          }
        : {
            stripePurchaseIntentId: null,
            stripePurchaseStatus: null,
            stripeAmountCharged: null,
          };

      const purchase = new SellOrderPurchase({
        userId: user.id,
        sellOrderId: sellOrder.id,
        assetId: sellOrder.assetId,
        fractionQty: purchaseDto.fractionsToPurchase,
        fractionPriceCents: purchaseDto.fractionPriceCents,
        ...stripeTrackingDetails,
      });
      sellOrder.fractionQtyAvailable -= purchaseDto.fractionsToPurchase;
      sellerAsset.quantityOwned -= purchaseDto.fractionsToPurchase;
      buyerAsset.quantityOwned += purchaseDto.fractionsToPurchase;
      await Promise.all([
        manager.save(purchase),
        manager.save(sellerAsset),
        manager.save(sellOrder),
        manager.save(buyerAsset),
      ]);
      Logger.log({
        buyer: user,
        seller: sellOrder.id,
        sellOrder: sellOrder,
        quantity: purchaseDto.fractionsToPurchase,
        completed: true,
      });
      return purchase;
    });
    if (!purchase) {
      Logger.error({
        buyer: user,
        sellOrderId: idDto.id,
        quantity: purchaseDto.fractionsToPurchase,
        completed: false,
      });
    }
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
    // eslint-disable-next-line no-magic-numbers
    return (await query.getRawOne()).total_purchased || 0;
  }

  static async userPurchaseQuery(user: User): Promise<SelectQueryBuilder<SellOrderPurchase>> {
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
