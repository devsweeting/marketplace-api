import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  RelationId,
  ManyToOne,
  JoinColumn,
  In,
  SelectQueryBuilder,
  Brackets,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Attribute, Label } from './';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';
import { File } from 'modules/storage/file.entity';
import { AssetDto, AttributeDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { MarketplaceEnum } from 'modules/assets/enums/marketplace.enum';
import { AuctionTypeEnum } from 'modules/assets/enums/auction-type.enum';
import { Contract } from 'modules/assets/entities/contract.entity';

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

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId', referencedColumnName: 'id' })
  public contract: Contract;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.contract)
  public contractId: string;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug(this.name);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.slug = generateSlug(this.name);
  }

  public static findDuplicatedByRefIds(refIds: string[]): Promise<Asset[]> {
    return Asset.find({
      where: {
        refId: In(refIds),
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
      await Promise.all(
        dto.attributes?.map((attribute: AttributeDto) =>
          new Attribute({ ...attribute, assetId: asset.id }).save(),
        ),
      );
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException();
    }
    return newAsset;
  }

  public static list(params: ListAssetsDto): SelectQueryBuilder<Asset> {
    const query = Asset.createQueryBuilder('asset')
      .leftJoinAndMapMany('asset.attributes', 'asset.attributes', 'attributes')
      .leftJoinAndMapOne('asset.image', 'asset.image', 'image')
      .where('asset.isDeleted = :isDeleted', { isDeleted: false })
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
