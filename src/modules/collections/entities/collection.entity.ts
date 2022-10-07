import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
  Index,
  JoinColumn,
  Like,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { ListCollectionsDto } from '../dto/list-collections.dto';
import { File } from 'modules/storage/entities/file.entity';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { Asset } from 'modules/assets/entities';
import { CollectionAsset } from './collection-asset.entity';

@Entity('collections')
export class Collection extends BaseModel implements IBaseEntity {
  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ nullable: false, unique: true })
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

  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    const collectionsCount = await Asset.count({
      where: { slug: Like(`%${this.name}%`), isDeleted: false, deletedAt: null },
    });
    const name = collectionsCount > 0 ? `${this.name}-${Date.now()}` : this.name;
    this.slug = generateSlug(name);
  }

  @BeforeUpdate()
  public async beforeUpdate(): Promise<void> {
    const name = await this.findSlugDuplicate(this.id);
    this.slug = generateSlug(name);
  }

  public static list(params: ListCollectionsDto): SelectQueryBuilder<Collection> {
    const query = Collection.createQueryBuilder('collection')
      .leftJoinAndMapMany(
        'collection.collectionAssets',
        'collection.collectionAssets',
        'collectionAssets',
      )
      .leftJoinAndMapOne(
        'collectionAssets.asset',
        'collectionAssets.asset',
        'asset',
        'asset.isDeleted = FALSE',
      )
      .leftJoinAndMapOne('collection.banner', 'collection.banner', 'banner')
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

  private async findSlugDuplicate(id: string = null): Promise<string> {
    const collections = await Collection.find({
      where: { slug: Like(`%${this.name}%`), isDeleted: false, deletedAt: null },
    });
    const collection = collections.find((el) => el.id === id);
    if (collection) {
      return collection.name !== this.name ? `${this.name}-${Date.now()}` : collection.slug;
    } else {
      return this.name;
    }
  }

  public constructor(partial: Partial<Collection> = {}) {
    super();
    Object.assign(this, partial);
  }
}
