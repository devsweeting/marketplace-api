import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Asset } from 'modules/assets/entities/asset.entity';
import { EventTypeEnum } from '../enums/event-type.enum';
import { PaymentTokenEnum } from '../enums/payment-token.enum';
import { ListEventsDto } from '../dto/list-events.dto';

@Entity('asset_events')
@Index(['assetId', 'createdAt'])
export class Event extends BaseModel implements BaseEntityInterface {
  @Column({ nullable: false })
  public fromAccount: string;

  @Column({ nullable: true })
  public fromAddress: string;

  @Column({ nullable: true })
  public toAccount: string;

  @Column({ nullable: true })
  public toAddress: string;

  @Column({
    type: 'enum',
    enum: PaymentTokenEnum,
    nullable: true,
  })
  public paymentToken: PaymentTokenEnum;

  @Column({
    type: 'enum',
    enum: EventTypeEnum,
    nullable: false,
    default: EventTypeEnum.Created,
  })
  public eventType: EventTypeEnum;

  @Column({ nullable: false, default: false })
  public isPrivate: boolean;

  @Column({ default: 1, nullable: true })
  public quantity: number;

  @Column({ type: 'float', nullable: true })
  public totalPrice: number;

  @ManyToOne(() => Asset, (asset) => asset.events, { nullable: false })
  @JoinColumn({ referencedColumnName: 'id' })
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
