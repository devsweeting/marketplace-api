import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  RelationId,
  OneToMany,
  SelectQueryBuilder,
} from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities/user.entity';
import { WatchlistAsset } from './watchlist-asset.entity';
import { ListWatchlistDto } from '../dto';

@Entity('watchlist')
export class Watchlist extends BaseModel implements IBaseEntity {
  @OneToOne(() => User, (user) => user.watchlist, { nullable: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  public user: User;

  @Column({ type: 'uuid', nullable: false })
  @RelationId((watchlist: Watchlist) => watchlist.user)
  public userId: string;

  @OneToMany(() => WatchlistAsset, (watchlistAsset) => watchlistAsset.watchlist)
  public watchlistAssets: WatchlistAsset[];

  constructor(partial: Partial<Watchlist> = {}) {
    super();
    Object.assign(this, partial);
  }

  public static list(params: ListWatchlistDto, user: User): SelectQueryBuilder<WatchlistAsset> {
    return WatchlistAsset.createQueryBuilder('watchlistAsset')
      .leftJoinAndMapOne('watchlistAsset.watchlist', 'watchlistAsset.watchlist', 'watchlist')
      .leftJoinAndMapOne('watchlistAsset.asset', 'watchlistAsset.asset', 'asset')
      .where('watchlist.userId = :userId', { userId: user.id })
      .andWhere('watchlistAsset.isDeleted = FALSE AND watchlistAsset.deletedAt IS NULL')
      .addOrderBy(params.sort, params.order);
  }
}
