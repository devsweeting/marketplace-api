import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  Like,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Raw,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Label } from './';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { Partner } from 'modules/partners/entities';
import { AssetDto, AttributeDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { Event } from 'modules/events/entities';
import { Token } from './token.entity';
import { Collection, CollectionAsset } from 'modules/collections/entities';
import { AttributeLteMustBeGreaterThanGteException } from '../exceptions/attribute-lte-greater-than-gte.exception';
import { Media } from './media.entity';
import { POSTGRES_DUPE_KEY_ERROR } from 'modules/common/constants';
import { AssetsDuplicatedException } from '../exceptions/assets-duplicated.exception';
import { decodeHashId } from 'modules/common/helpers/hash-id.helper';
import { ConfigService } from '@nestjs/config';
import { SellOrder } from 'modules/sell-orders/entities';
import { InjectDataSource } from '@nestjs/typeorm';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/src/app.module';

export class AssetAttributes {
  constructor(attrs: AttributeDto[] = []) {
    for (const attr of attrs) {
      this.add(attr.trait, attr.value);
    }
  }

  public add(key: string, val: string | number) {
    key = key.toLowerCase();
    if (this[key] === undefined) {
      this[key] = [];
    }
    this[key].push(val);
  }
}

@Entity('partner_assets')
// This requires two partial indexes because Postgres treats all
// null values as unique
@Index('PARTNER_REF_UNIQUE', ['refId', 'partnerId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Index('PARTNER_REF_UNIQUE_DEL', ['refId', 'partnerId', 'deletedAt'], {
  unique: true,
  where: '"deletedAt" IS NOT NULL',
})
@Index('ts_name_idx', { synchronize: false })
@Index('ts_description_idx', { synchronize: false })
export class Asset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false, length: 100 })
  public refId: string;

  @Index()
  @Column({ length: 200, nullable: false })
  public name: string;

  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: `to_tsvector('english', name)`,
    nullable: true,
    readonly: true,
  })
  public readonly ts_name?: string;

  @Index()
  @Column({ nullable: false, unique: true })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({
    type: 'tsvector',
    generatedType: 'STORED',
    asExpression: `to_tsvector('english', description)`,
    nullable: true,
    readonly: true,
  })
  public readonly ts_description?: string;

  @ManyToOne(() => Partner, (partner) => partner.assets)
  @JoinColumn({ name: 'partnerId' })
  public partner?: Partner;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.partner)
  public partnerId: string;

  @Column({ type: 'jsonb', nullable: false, name: 'attributesJson', default: [] })
  public attributes: AssetAttributes;

  @Column({ type: 'int', nullable: false, default: 0 })
  public fractionQtyTotal: number;

  @OneToMany(() => Label, (label) => label.asset)
  public labels: Label[];

  @OneToOne(() => Token, (token) => token.asset, { nullable: true })
  public token: Token | null;

  @OneToMany(() => Media, (media) => media.asset)
  public media: Media[];

  @OneToMany(() => Event, (event) => event.asset)
  public events: Event[];

  @OneToMany(() => CollectionAsset, (collectionAsset) => collectionAsset.asset)
  public collectionAssets: CollectionAsset[];

  @OneToMany(() => SellOrder, (sellOrder) => sellOrder.asset)
  public sellOrders: SellOrder[];

  @BeforeInsert()
  public async beforeInsert(): Promise<void> {
    const assetsCount = await Asset.count({
      where: {
        slug: Raw((alias) => `${alias} ILIKE '%${generateSlug(this.name)}%'`),
        isDeleted: false,
        deletedAt: null,
      },
    });

    const name = assetsCount > 0 ? `${this.name} ${Date.now()}` : this.name;
    this.slug = generateSlug(name);
  }

  @BeforeUpdate()
  public async beforeUpdate(): Promise<void> {
    const name = await this.findSlugDuplicate(this.id);
    this.slug = generateSlug(name);
  }

  public static async saveAssetForPartner(dto: AssetDto, partner: Partner): Promise<Asset> {
    try {
      const asset = new Asset({
        refId: dto.refId,
        name: dto.name,
        partner: partner,
        partnerId: partner.id,
        description: dto.description,
        fractionQtyTotal: dto.fractionQtyTotal,
      });

      await this.getRepository().manager.transaction(async (txMgr) => {
        asset.attributes = new AssetAttributes(dto.attributes);
        await txMgr.save(asset);
        const event = new Event({ fromAccount: partner.accountOwnerId, asset: asset });
        await txMgr.save(event);
      });
      return asset;
    } catch (e) {
      if (e.code === POSTGRES_DUPE_KEY_ERROR && e.constraint == 'PARTNER_REF_UNIQUE') {
        throw new AssetsDuplicatedException([dto.refId]);
      }
      throw e;
    }
  }

  public static list(
    params: ListAssetsDto,
    configService: ConfigService,
  ): SelectQueryBuilder<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .andWhere('asset.isDeleted = :isDeleted AND asset.deletedAt IS NULL', { isDeleted: false })
      .addOrderBy(params.sort, params.order)
      .addGroupBy('asset.id');

    if (params.partner) {
      query.andWhere('asset.partnerId = :partnerId', {
        partnerId: decodeHashId(params.partner, configService.get('common.default.hashIdSalt')),
      });
    }

    if (params.query) {
      query.andWhere(
        new Brackets((b) => {
          b.orWhere('LOWER(asset.name) LIKE LOWER(:query)', { query: `%${params.query}%` });
        }),
      );
    }
    if (params.search) {
      const searchQuery = `${params.search.split(' ').join(':* | ')}:*`;
      query.andWhere(
        new Brackets((b) => {
          b.andWhere(
            `asset.ts_name @@ to_tsquery('english', :searchQuery) OR asset.ts_description @@ to_tsquery('english', :searchQuery)`,
            { searchQuery: searchQuery },
          );
        }),
      );
    }

    if (params.attr_eq) {
      const keys = Object.keys(params.attr_eq);
      if (keys.length > 0) {
        const group = {};
        for (const attr in params.attr_eq) {
          const val = params.attr_eq[attr];
          if (typeof val === 'string') {
            group[attr] = [val];
          } else if (Array.isArray(val)) {
            group[attr] = val;
          }
        }

        for (const [attr, vals] of Object.entries(group)) {
          const v: string[] = vals as string[];
          query.andWhere(
            new Brackets((b) => {
              for (const val of v) {
                b.orWhere(`asset.attributesJson @? :match`, {
                  match: `$."${attr}" ? (@ like_regex "(?i)^${val}$")`,
                });
              }
            }),
          );
        }
      }
    }

    if (params.attr_gte || params.attr_lte) {
      const lte_group = {};
      const gte_group = {};
      for (const attr in params.attr_lte) {
        const val = params.attr_lte[attr];
        if (Array.isArray(val)) {
          throw 'Too many values for parameter';
        }

        lte_group[attr] = parseFloat(val);
      }
      for (const attr in params.attr_gte) {
        const val = params.attr_gte[attr];
        if (Array.isArray(val)) {
          throw 'Too many values for parameter';
        }
        gte_group[attr] = parseFloat(val);
      }

      for (const [attr, val] of Object.entries(lte_group)) {
        if (gte_group[attr] !== undefined && val < gte_group[attr]) {
          throw new AttributeLteMustBeGreaterThanGteException();
        }
      }
      let i = 0;

      for (const [attr, val] of Object.entries(lte_group)) {
        query.andWhere(
          new Brackets((b) => {
            const matchName = `match_${i++}`;
            const params = {};
            params[matchName] = `$."${attr.toLowerCase()}" ? (@.double() <= ${val})`;
            b.andWhere(`asset.attributesJson @? :${matchName}`, params);
          }),
        );
      }
      for (const [attr, val] of Object.entries(gte_group)) {
        query.andWhere(
          new Brackets((b) => {
            const matchName = `match_${i++}`;
            const params = {};
            params[matchName] = `$."${attr.toLowerCase()}" ? (@.double() >= ${val})`;
            b.andWhere(`asset.attributesJson @? :${matchName}`, params);
          }),
        );
      }
    }
    return query;
  }

  private static filterRangeArray(arr1: string[], arr: string[]) {
    return arr1.filter((el) => {
      return !arr.some((s) => {
        return s === el;
      });
    });
  }

  private async findSlugDuplicate(id: string = null): Promise<string> {
    const assets = await Asset.find({
      where: { slug: Like(`%${this.name}%`), isDeleted: false, deletedAt: null },
    });
    const asset = assets.find((el) => el.id === id);
    if (asset) {
      return asset.name !== this.name ? `${this.name}-${Date.now()}` : asset.slug;
    } else {
      return this.name;
    }
  }

  public static async getAssetBySlugOrId(slug: string, id: string): Promise<Asset | undefined> {
    const query = Asset.createQueryBuilder('asset');
    if (id) {
      query.where('asset.id = :id', { id });
    } else {
      query.where('asset.slug = :slug', { slug });
    }
    query.andWhere('asset.isDeleted = FALSE');
    query.andWhere('asset.deletedAt IS NULL');
    return query.getOne();
  }

  public static async getAssetsByIds(assetIds: string[]): Promise<Asset[] | undefined> {
    const query = Asset.createQueryBuilder('asset');
    query.andWhere('asset.isDeleted = FALSE');
    query.andWhere('asset.deletedAt IS NULL');
    query.andWhereInIds(assetIds);
    return query.getMany();
  }

  public constructor(partial: Partial<Asset> = {}) {
    super();
    Object.assign(this, partial);
  }
}
