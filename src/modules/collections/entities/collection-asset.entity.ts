import { IsUUID } from 'class-validator';
import { Asset } from 'modules/assets/entities';

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collection } from '.';
import { IBaseEntity } from 'modules/common/entities/base.entity.interface';

@Entity('collections_assets')
export class CollectionAsset extends BaseEntity implements IBaseEntity {
  @Index()
  @PrimaryColumn({ type: 'uuid' })
  public collectionId: string;

  @ManyToOne(() => Collection, (collection) => collection.collectionAssets)
  @JoinColumn({ name: 'collectionId' })
  public collection: Collection;

  @Index()
  @PrimaryColumn({ type: 'uuid' })
  public assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.collectionAssets)
  @JoinColumn({ name: 'assetId' })
  public asset: Asset;

  @IsUUID()
  @Column()
  @Generated('uuid')
  public id: string;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  public deletedAt: Date | null;

  @Column({ default: false })
  public isDeleted: boolean | false;

  public constructor(partial: Partial<CollectionAsset> = {}) {
    super();
    Object.assign(this, partial);
  }
}
