import {
  AfterInsert,
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

  @AfterInsert()
  public afterInsert(): void {
    Partner.findOne({ where: { id: this.partnerId } }).then((partner) => {
      const assetEvent = new Event({ fromAccount: partner.accountOwnerId, asset: this });
      assetEvent.save();
    });
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
    let newAsset = null;

    try {
      const asset = new Asset({
        refId: dto.refId,
        name: dto.name,
        partner: partner,
        partnerId: partner.id,
        description: dto.description,
      });

      asset.partner = partner;
      newAsset = await asset.save();

      if (dto.attributes) {
        await Promise.all(
          dto.attributes.map((attribute: AttributeDto) =>
            new Attribute({ ...attribute, assetId: asset.id }).save(),
          ),
        );
      }
    } catch (e) {
      if (e.code === POSTGRES_DUPE_KEY_ERROR && e.constraint == 'PARTNER_REF_UNIQUE') {
        throw new AssetsDuplicatedException([dto.refId]);
      }
      throw new InternalServerErrorException();
    }
    return newAsset;
  }

  public static list(
    params: ListAssetsDto,
    configService: ConfigService,
  ): SelectQueryBuilder<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .andWhere('asset.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('asset.deletedAt IS NULL')
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
      query.andWhere(
        new Brackets((b) => {
          b.andWhere(
            `asset.ts_name @@ websearch_to_tsquery('english', :searchQuery) OR asset.ts_description @@ websearch_to_tsquery('english', :searchQuery)`,
            { searchQuery: params.search },
          );
        }),
      );
    }

    if (params.attr_eq || params.attr_gte || params.attr_lte) {
      query.innerJoin(
        'asset.attributes',
        'attributes',
        'attributes.isDeleted = FALSE AND attributes.deletedAt IS NULL',
      );
    }

    if (params.attr_eq && Object.keys(params.attr_eq).length) {
      let traitValues;
      query.andWhere(
        new Brackets((b) => {
          return Object.entries(params.attr_eq).map((attr) => {
            traitValues = Array.isArray(attr[1]) ? attr[1] : [attr[1]];
            return b.orWhere(
              'attributes.trait ILIKE :trait AND attributes.value IN (:...traitValues) ',
              { trait: `%${attr[0]}%%`, traitValues },
            );
          });
        }),
      );
    }

    if (params.label_eq && Object.keys(params.label_eq).length) {
      query.innerJoin(
        'asset.labels',
        'labels',
        'labels.isDeleted = FALSE AND labels.deletedAt IS NULL',
      );
      let labelValues;
      query.andWhere(
        new Brackets((b) => {
          return Object.entries(params.label_eq).map((label) => {
            labelValues = Array.isArray(label[1]) ? label[1] : [label[1]];
            return b.orWhere(
              'labels.name ILIKE :name AND LOWER(labels.value) IN (:...labelValues) ',
              {
                name: `%${label[0]}%%`,
                labelValues,
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
      const fromArr = fromAttr.filter((el) => {
        return !arr.some((s) => {
          return s === el;
        });
      });
      const toArr = toAttr.filter((el) => {
        return !arr.some((s) => {
          return s === el;
        });
      });
      if (arr.length) {
        arr.map((attr) => {
          if (params.attr_gte[attr] >= params.attr_lte[attr]) {
            throw new AttributeLteMustBeGreaterThanGteException();
          }
          return query.orWhere(
            new Brackets((b) => {
              b.andWhere(
                'attributes.trait ILIKE :commonTrait AND attributes.value::integer >= :fromValue AND attributes.value::integer <= :toValue',
                {
                  commonTrait: `%${attr}%%`,
                  fromValue: params.attr_gte[attr],
                  toValue: params.attr_lte[attr],
                },
              );
            }),
          );
        });
      }
      if (fromArr) {
        fromArr.map((attr) => {
          return query.orWhere(
            new Brackets((b) => {
              b.andWhere(
                'attributes.trait ILIKE :fromTrait AND attributes.value::integer >= :from',
                {
                  fromTrait: `%${attr}%%`,
                  from: params.attr_gte[attr],
                },
              );
            }),
          );
        });
      }
      if (toArr) {
        toArr.map((attr) => {
          return query.orWhere(
            new Brackets((b) => {
              b.andWhere('attributes.trait ILIKE :toTrait AND attributes.value::integer <= :to', {
                toTrait: `%${attr}%%`,
                to: params.attr_lte[attr],
              });
            }),
          );
        });
      }
    }
    return query;
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
