import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Asset } from 'modules/assets/entities';
import { Watchlist } from './watchlist.entity';

@Entity('watchlist_assets')
export class WatchlistAsset extends BaseModel implements BaseEntityInterface {
  @ManyToOne(() => Watchlist, { eager: false, nullable: false })
  @JoinColumn({ name: 'watchlistId', referencedColumnName: 'id' })
  public watchlist: Watchlist;

  @Column({ primary: true, type: 'uuid', nullable: false })
  @RelationId((watchlistAsset: WatchlistAsset) => watchlistAsset.watchlist)
  public watchlistId: string;

  @ManyToOne(() => Asset, { eager: false, nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ primary: true, type: 'uuid', nullable: false })
  @RelationId((watchlistAsset: WatchlistAsset) => watchlistAsset.asset)
  public assetId: string;

  constructor(partial: Partial<WatchlistAsset>) {
    super();
    Object.assign(this, partial);
  }
}
