import { IsUUID } from 'class-validator';
import { Asset } from 'modules/assets/entities';

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collection } from '.';

@Entity('collections_assets')
export class CollectionAsset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Column({ primary: true, type: 'uuid' })
  public collectionId: string;

  @Column({ primary: true, type: 'uuid' })
  public assetId: string;

  @ManyToOne(() => Collection)
  @JoinColumn({ name: 'collectionId' })
  public collection: Collection;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'assetId' })
  public asset: Asset;

  @UpdateDateColumn()
  public updatedAt: Date;

  @CreateDateColumn()
  public createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  public deletedAt: Date | null;

  @Column({ default: false })
  public isDeleted: boolean | false;

  public constructor(partial: Partial<CollectionAsset>) {
    super();
    Object.assign(this, partial);
  }
}
