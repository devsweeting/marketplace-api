import {
  BeforeInsert,
  BeforeUpdate,
  Brackets,
  Column,
  Entity,
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
import { InternalServerErrorException } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { AssetDto, AttributeDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { Contract } from 'modules/assets/entities/contract.entity';
import { Event } from 'modules/events/entities';
import { Token } from './token.entity';
import { File } from 'modules/storage/entities/file.entity';
import { CollectionAsset } from 'modules/collections/entities';
import { Media } from './media.entity';
import { POSTGRES_DUPE_KEY_ERROR } from 'modules/common/constants';
import { AssetsDuplicatedException } from '../exceptions/assets-duplicated.exception';

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
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ nullable: false })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

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

  @OneToMany(() => Media, (media) => media.asset)
  public medias: Media[];

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

  public static list(params: ListAssetsDto): SelectQueryBuilder<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapOne('asset.image', 'asset.image', 'image')
      .andWhere('asset.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('asset.deletedAt IS NULL')
      .addOrderBy(params.sort, params.order);

    if (params.query) {
      query.andWhere(
        new Brackets((b) => {
          b.orWhere('LOWER(asset.name) LIKE LOWER(:query)', { query: `%${params.query}%` });
        }),
      );
    }
    return query;
  }

  public constructor(partial: Partial<Asset>) {
    super();
    Object.assign(this, partial);
  }
}
