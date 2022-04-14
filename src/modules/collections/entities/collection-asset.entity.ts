import { Asset } from 'modules/assets/entities';
import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Collection } from '.';

@Entity({ name: 'collections_assets' })
export class CollectionAsset extends BaseModel implements BaseEntityInterface {
  @Column({ primary: true })
  public collectionId: string;

  @Column({ primary: true })
  public assetId: string;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collectionId' })
  public collection: Collection;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'assetId' })
  public asset: Asset;

  public constructor(partial: Partial<CollectionAsset>) {
    super();
    Object.assign(this, partial);
  }
}
