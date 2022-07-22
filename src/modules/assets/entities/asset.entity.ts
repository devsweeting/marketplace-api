import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
  getConnection,
  Index,
  JoinColumn,
  Like,
  ManyToOne,
  OneToMany,
  OneToOne,
  Raw,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Attribute, Label } from './';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { InternalServerErrorException } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { AssetDto, AttributeDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { Event } from 'modules/events/entities';
import { Token } from './token.entity';
import { CollectionAsset } from 'modules/collections/entities';
import { AttributeLteMustBeGreaterThanGteException } from '../exceptions/attribute-lte-greater-than-gte.exception';
import { Media } from './media.entity';
import { POSTGRES_DUPE_KEY_ERROR } from 'modules/common/constants';
import { AssetsDuplicatedException } from '../exceptions/assets-duplicated.exception';
import { decodeHashId } from 'modules/common/helpers/hash-id.helper';
import { ConfigService } from '@nestjs/config';

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
export class Asset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false, length: 100 })
  public refId: string;

  @Index()
  @Column({ length: 200, nullable: false })
  public name: string;

  @Index()
  @Column({ nullable: false, unique: true })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @ManyToOne(() => Partner, (partner) => partner.assets)
  @JoinColumn({ name: 'partnerId' })
  public partner?: Partner;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.partner)
  public partnerId: string;

  @OneToMany(() => Attribute, (attribute) => attribute.asset)
  public attributes: Attribute[];

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

  public async saveAttributes(attributes: AttributeDto[]): Promise<Attribute[]> {
    await Attribute.delete({ assetId: this.id });
    return Promise.all(
      attributes.map((attribute) => new Attribute({ ...attribute, assetId: this.id }).save()),
    );
  }

  public static async saveAssetForPartner(dto: AssetDto, partner: Partner): Promise<Asset> {
    try {
      const asset = new Asset({
        refId: dto.refId,
        name: dto.name,
        partner: partner,
        partnerId: partner.id,
        description: dto.description,
      });
      await getConnection().transaction(async (txMgr) => {
        await txMgr.save(asset);
        if (dto.attributes) {
          await Promise.all(
            dto.attributes.map((attribute: AttributeDto) =>
              txMgr.save(new Attribute({ ...attribute, assetId: asset.id })),
            ),
          );
        }

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

    if (params.attr_eq || params.attr_gte || params.attr_lte) {
      query.leftJoin(
        'asset.attributes',
        'attributes',
        'attributes.isDeleted = FALSE AND attributes.deletedAt IS NULL',
      );
    }

    if (params.attr_eq && Object.keys(params.attr_eq).length) {
      let traitValues;
      query.andHaving('array_agg(attributes.trait)::text[] @> ARRAY[:...attrEqArr]', {
        attrEqArr: Object.keys(params.attr_eq),
      });
      query.andWhere(
        new Brackets((b) => {
          return Object.entries(params.attr_eq).map((attr, index) => {
            traitValues = Array.isArray(attr[1]) ? attr[1] : [attr[1]];
            b.orWhere(
              `attributes.trait ILIKE :trait${index} AND attributes.value IN (:...traitValues${index})`,
              {
                [`trait${index}`]: `%${attr[0]}%%`,
                [`traitValues${index}`]: traitValues,
              },
            );
          });
        }),
      );
    }

    if (params.label_eq && Object.keys(params.label_eq).length) {
      query.leftJoin(
        'asset.labels',
        'labels',
        'labels.isDeleted = FALSE AND labels.deletedAt IS NULL',
      );
      let labelValues;
      query.andHaving('array_agg(labels.name)::text[] @> ARRAY[:...labelEqArr]', {
        labelEqArr: Object.keys(params.label_eq),
      });
      query.andWhere(
        new Brackets((b) => {
          return Object.entries(params.label_eq).map((label, index) => {
            labelValues = Array.isArray(label[1]) ? label[1] : [label[1]];
            return b.orWhere(
              `labels.name ILIKE :name${index} AND LOWER(labels.value) IN (:...labelValues${index})`,
              {
                [`name${index}`]: `%${label[0]}%%`,
                [`labelValues${index}`]: labelValues,
              },
            );
          });
        }),
      );
    }

    if (params.attr_lte || params.attr_gte) {
      const fromAttr = params.attr_gte ? Object.keys(params.attr_gte) : [];
      const toAttr = params.attr_lte ? Object.keys(params.attr_lte) : [];
      const arr = fromAttr.length
        ? fromAttr.filter((value) => toAttr.includes(value))
        : toAttr.filter((value) => fromAttr.includes(value));
      const fromArr = this.filterRangeArray(fromAttr, arr);
      const toArr = this.filterRangeArray(toAttr, arr);
      if (arr.length) {
        if (Object.keys(params.attr_gte).length > 1) {
          query.andHaving('array_agg(attributes.trait)::text[] @> ARRAY[:...arr]', { arr: arr });
        }

        const subQuery = new Brackets((b) => {
          return arr.map((attr, index) => {
            if (Number(params.attr_gte[attr]) >= Number(params.attr_lte[attr])) {
              throw new AttributeLteMustBeGreaterThanGteException();
            }
            b.orWhere(
              `attributes.trait ILIKE :commonTrait${index} AND attributes.value::float >= :fromValue${index} AND attributes.value::float <= :toValue${index}`,
              {
                [`commonTrait${index}`]: `%${attr}%%`,
                [`fromValue${index}`]: params.attr_gte[attr],
                [`toValue${index}`]: params.attr_lte[attr],
              },
            );
          });
        });
        params.attr_eq ? query.orWhere(subQuery) : query.andWhere(subQuery);
      }
      if (fromArr.length) {
        if (params.attr_eq || fromArr.length > 1) {
          query.having('array_agg(attributes.trait)::text[] @> ARRAY[:...fromArr]', {
            fromArr: fromArr,
          });
        }
        const subQuery = new Brackets((b) => {
          fromArr.map((attr, index) => {
            b.orWhere(
              `attributes.trait ILIKE :fromTrait${index} AND attributes.value::float >= :from${index}`,
              {
                [`fromTrait${index}`]: `%${attr}%%`,
                [`from${index}`]: params.attr_gte[attr],
              },
            );
          });
        });

        params.attr_eq ? query.orWhere(subQuery) : query.andWhere(subQuery);
      }
      if (toArr.length) {
        if (params.attr_eq || toArr.length > 1) {
          query.having('array_agg(attributes.trait)::text[] @> ARRAY[:...toArr]', {
            toArr: toArr,
          });
        }
        const subQuery = new Brackets((b) => {
          toArr.map((attr, index) => {
            b.orWhere(
              `attributes.trait ILIKE :toTrait${index} AND attributes.value::float <= :to${index}`,
              {
                [`toTrait${index}`]: `%${attr}%%`,
                [`to${index}`]: params.attr_lte[attr],
              },
            );
          });
        });

        params.attr_eq ? query.orWhere(subQuery) : query.andWhere(subQuery);
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

  public constructor(partial: Partial<Asset>) {
    super();
    Object.assign(this, partial);
  }
}
