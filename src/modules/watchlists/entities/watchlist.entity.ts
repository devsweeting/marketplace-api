import { Column, Entity, JoinColumn, OneToOne, RelationId, OneToMany } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities/user.entity';
import { WatchlistAsset } from './watchlist-asset.entity';

@Entity('watchlist')
export class Watchlist extends BaseModel implements BaseEntityInterface {
  @OneToOne(() => User, (user) => user.watchlist, { nullable: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  public user: User;

  @Column({ type: 'uuid', nullable: false })
  @RelationId((watchlist: Watchlist) => watchlist.user)
  public userId: string;

  @OneToMany(() => WatchlistAsset, (watchlistAsset) => watchlistAsset.watchlist)
  public watchlistAssets: WatchlistAsset[];

  constructor(partial: Partial<Watchlist>) {
    super();
    Object.assign(this, partial);
  }
}
