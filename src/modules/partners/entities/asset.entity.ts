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
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Attribute, Partner } from './';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { AssetDto, AttributeDto } from 'modules/partners/dto';
import { InternalServerErrorException, Logger } from '@nestjs/common';

@Entity('partner_assets')
export class Asset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false, length: 100 })
  public refId: string;

  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ length: 100, nullable: false })
  public image: string;

  @Index()
  @Column({ nullable: false })
  public slug: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({ nullable: true })
  public externalUrl: string;

  @ManyToOne(() => Partner, (partner) => partner.assets)
  @JoinColumn({ name: 'partnerId' })
  public partner?: Partner;

  @Column({ type: 'string', nullable: true })
  @RelationId((asset: Asset) => asset.partner)
  public partnerId: string;

  @OneToMany(() => Attribute, (attribute) => attribute.assetId)
  public attributes: Attribute[];

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = generateSlug(this.name);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.slug = generateSlug(this.name);
  }

  public static findDuplicatedBySlugs(slugs: string[]): Promise<Asset[]> {
    return Asset.find({
      where: {
        slug: In(slugs),
      },
    });
  }

  public static async saveAssetsForPartner(
    dtoList: Array<AssetDto>,
    partner: Partner,
  ): Promise<void> {
    for (const dto of dtoList) {
      try {
        const asset = new Asset({
          refId: dto.refId,
          name: dto.name,
          image: dto.image,
          partner: partner,
          partnerId: partner.id,
          description: dto.description,
          externalUrl: dto.externalUrl,
        });
        asset.partner = partner;
        await asset.save();
        await Promise.all(
          dto.attributes?.map((attribute: AttributeDto) =>
            new Attribute({ ...attribute, assetId: asset.id }).save(),
          ),
        );
      } catch (e) {
        Logger.error(e);
        throw new InternalServerErrorException();
      }
    }
  }

  public constructor(partial: Partial<Asset>) {
    super();
    Object.assign(this, partial);
  }
}
