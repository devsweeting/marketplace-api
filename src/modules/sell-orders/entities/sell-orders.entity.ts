import { Column, Entity, JoinColumn, ManyToOne, RelationId, SelectQueryBuilder } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { ListSellOrderDto } from '../dto';
import { Partner } from 'modules/partners/entities';
import { User } from 'modules/users/entities';
import { Asset } from 'modules/assets/entities';

@Entity('sell_orders')
export class SellOrder extends BaseModel implements BaseEntityInterface {
  @Column({ type: 'string', nullable: true })
  @RelationId((sellOrder: SellOrder) => sellOrder.user)
  public userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user?: User;

  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrder: SellOrder) => sellOrder.partner)
  public partnerId: string;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partnerId' })
  public partner?: Partner;

  @Column({ type: 'string', nullable: false })
  @RelationId((sellOrder: SellOrder) => sellOrder.asset)
  public assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'assetId' })
  public asset?: Asset;

  @Column({ type: 'bigint', nullable: false })
  public fractionQty: number;

  @Column({ type: 'bigint', nullable: false })
  public fractionPriceCents: number;

  @Column({ type: 'bigint', nullable: false })
  public expireTime: number;

  @Column({ type: 'bigint', nullable: false, default: 0 })
  public deletedTime: number;

  public constructor(partial: Partial<SellOrder>) {
    super();
    Object.assign(this, partial);
  }

  public static list(params: ListSellOrderDto): SelectQueryBuilder<SellOrder> {
    const query = SellOrder.createQueryBuilder('sellOrder')
      .leftJoinAndMapOne('sellOrder.asset', 'sellOrder.asset', 'asset')
      .where(
        'sellOrder.partnerId = :partnerId AND sellOrder.isDeleted = :isDeleted AND sellOrder.deletedAt IS NULL',
        {
          partnerId: params.partnerId,
          isDeleted: false,
        },
      )
      .addOrderBy(params.sort, params.order);

    if (params.assetId) {
      query.andWhere('sellOrder.assetId = :assetId', {
        assetId: params.assetId,
      });
    }
    if (params.slug) {
      query.andWhere('asset.slug = :slug', {
        slug: params.slug,
      });
    }
    if (params.email) {
      query
        .leftJoinAndMapMany('sellOrder.user', 'sellOrder.user', 'user')
        .andWhere('user.email = :email', { email: params.email });
    }

    return query;
  }
}
