import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
  In,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Attribute, Label } from './';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { AssetDto, AttributeDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { MarketplaceEnum } from 'modules/assets/enums/marketplace.enum';
import { AuctionTypeEnum } from 'modules/assets/enums/auction-type.enum';
import { Contract } from 'modules/assets/entities/contract.entity';
import { Event } from 'modules/events/entities';
import { Token } from './token.entity';
import { File } from 'modules/storage/entities/file.entity';
import { CollectionAsset } from 'modules/collections/entities';
import { AttributeLteMustBeGreaterThanGteException } from '../exceptions/attribute-lte-greater-than-gte.exception';

@Entity('partner_assets')
export class Asset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false, length: 100 })
  public refId: string;

  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ nullable: false })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({ nullable: true })
  public externalUrl: string;

  @Column({
    type: 'enum',
    enum: MarketplaceEnum,
    nullable: false,
    default: MarketplaceEnum.Jump,
  })
  public marketplace: MarketplaceEnum;

  @Column({
    type: 'enum',
    enum: AuctionTypeEnum,
    nullable: true,
  })
  public auctionType: AuctionTypeEnum;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'imageId' })
  public image?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.image)
  public imageId?: string;

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

  @OneToMany(() => Token, (token) => token.asset)
  public tokens: Token[];

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId', referencedColumnName: 'id' })
  public contract: Contract;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.contract)
  public contractId: string;

  @OneToMany(() => Event, (event) => event.asset)
  public events: Event[];

  @OneToMany(() => CollectionAsset, (collectionAsset) => collectionAsset.asset)
  public collectionAssets: CollectionAsset[];

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug(this.name);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.slug = generateSlug(this.name);
  }

  public static findDuplicatedByRefIds(partnerId: string, refIds: string[]): Promise<Asset[]> {
    return Asset.find({
      where: {
        refId: In(refIds),
        partnerId,
      },
    });
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
        externalUrl: dto.externalUrl,
        marketplace: dto.listing.marketplace,
        auctionType: dto.listing.auctionType,
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
      Logger.error(e);
      throw new InternalServerErrorException();
    }
    return newAsset;
  }

  public static list(params: ListAssetsDto): SelectQueryBuilder<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapOne('asset.image', 'asset.image', 'image')
      .andWhere('asset.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('asset.deletedAt IS NULL')
      .addOrderBy(params.sort, params.order)
      .addGroupBy('asset.id, image.id');

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
            'LOWER(asset.name) @@ to_tsquery(:searchQuery) OR LOWER(asset.description) @@ to_tsquery(:searchQuery)',
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
    let values;
    if (params.attr_eq && Object.keys(params.attr_eq).length) {
      query.andWhere(
        new Brackets((b) => {
          return Object.entries(params.attr_eq).map((attr) => {
            values = Array.isArray(attr[1]) ? attr[1] : [attr[1]];

            return b.orWhere(
              'LOWER(attributes.trait) = LOWER(:trait) AND LOWER(attributes.value) IN (:...values) ',
              { trait: attr[0], values },
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

      Object.entries(params.label_eq).map((label) => {
        return query.andWhere(
          new Brackets((b) => {
            b.andWhere(
              'LOWER(labels.name) = LOWER(:name) AND LOWER(labels.value) = LOWER(:value)',
              {
                name: label[0],
                value: label[1],
              },
            );
          }),
        );
      });
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
          return query.andWhere(
            new Brackets((b) => {
              b.andWhere(
                'LOWER(attributes.trait) = LOWER(:trait) AND attributes.value::integer >= :fromValue AND attributes.value::integer <= :toValue',
                {
                  trait: attr,
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
          return query.andWhere(
            new Brackets((b) => {
              b.andWhere(
                'LOWER(attributes.trait) = LOWER(:trait) AND attributes.value::integer >= :from',
                {
                  trait: attr,
                  from: params.attr_gte[attr],
                },
              );
            }),
          );
        });
      }
      if (toArr) {
        toArr.map((attr) => {
          return query.andWhere(
            new Brackets((b) => {
              b.andWhere(
                'LOWER(attributes.trait) = LOWER(:trait) AND attributes.value::integer <= :to',
                {
                  trait: attr,
                  to: params.attr_lte[attr],
                },
              );
            }),
          );
        });
      }
    }

    return query;
  }

  public constructor(partial: Partial<Asset>) {
    super();
    Object.assign(this, partial);
  }
}
