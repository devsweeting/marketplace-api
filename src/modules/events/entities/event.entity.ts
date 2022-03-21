import { Column, Entity, JoinColumn, ManyToOne, RelationId, SelectQueryBuilder } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Asset } from 'modules/assets/entities/asset.entity';
import { EventTypeEnum } from '../enums/event-type.enum';
import { PaymentTokenEnum } from '../enums/payment-token.enum';
import { ListEventsDto } from '../dto/list-events.dto';

@Entity('asset_events')
export class Event extends BaseModel implements BaseEntityInterface {
  @Column({ name: 'from_account', nullable: false })
  public fromAccount: string;

  @Column({ name: 'from_address', nullable: true })
  public fromAddress: string;

  @Column({ name: 'to_account', nullable: true })
  public toAccount: string;

  @Column({ name: 'to_address', nullable: true })
  public toAddress: string;

  @Column({
    name: 'payment_token',
    type: 'enum',
    enum: PaymentTokenEnum,
    nullable: false,
  })
  public paymentToken: PaymentTokenEnum;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EventTypeEnum,
    nullable: false,
    default: EventTypeEnum.Created,
  })
  public eventType: EventTypeEnum;

  @Column({ name: 'is_private', nullable: false, default: false })
  public isPrivate: boolean;

  @Column({ default: 1, nullable: false })
  public quantity: number;

  @Column({ name: 'total_price', type: 'float', nullable: false })
  public totalPrice: number;

  @ManyToOne(() => Asset, (asset) => asset.attributes, { nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: false })
  @RelationId((event: Event) => event.asset)
  public assetId: string;

  public static list(params: ListEventsDto): SelectQueryBuilder<Event> {
    const query = Event.createQueryBuilder('event')
      .leftJoinAndMapOne('event.asset', 'event.asset', 'asset')
      .where('asset.isDeleted = :isDeleted', { isDeleted: false })
      .where('event.isDeleted = :isDeleted', { isDeleted: false })
      .addOrderBy(params.sort, params.order);

    return query;
  }

  public constructor(partial: Partial<Event>) {
    super();
    Object.assign(this, partial);
  }
}
