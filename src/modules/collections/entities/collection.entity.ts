import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { ListCollectionsDto } from '../dto/list-collections.dto';
import { File } from 'modules/storage/entities/file.entity';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { Asset } from 'modules/assets/entities';
import { CollectionAsset } from './collection-asset.entity';

@Entity('collections')
export class Collection extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ nullable: false })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'bannerId' })
  public banner?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((collection: Collection) => collection.banner)
  public bannerId?: string;

  @OneToMany(() => CollectionAsset, (collectionAsset) => collectionAsset.collection)
  public collectionAssets: CollectionAsset[];

  @ManyToMany(() => Asset, (asset) => asset.collectionAssets, { eager: false })
  @JoinTable({
    name: 'collections_assets',
    joinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'asset_id',
      referencedColumnName: 'id',
    },
  })
  public assets: Asset[];

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug(this.name);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.slug = generateSlug(this.name);
  }

  public static list(params: ListCollectionsDto): SelectQueryBuilder<Collection> {
    const query = Collection.createQueryBuilder('collection')
      .leftJoinAndMapMany('collection.assets', 'collection.assets', 'assets')
      .leftJoinAndMapOne('collection.banner', 'collection.banner', 'banner')
      .where('assets.isDeleted = :isDeleted', { isDeleted: false })
      .where('collection.isDeleted = :isDeleted', { isDeleted: false })
      .addOrderBy(params.sort, params.order);

    if (params.query) {
      query.andWhere(
        new Brackets((b) => {
          b.orWhere('LOWER(collection.name) LIKE LOWER(:query)', { query: `%${params.query}%` });
        }),
      );
    }

    return query;
  }

  public constructor(partial: Partial<Collection>) {
    super();
    Object.assign(this, partial);
  }
}
