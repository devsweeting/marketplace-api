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
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Attribute, Partner } from './';

@Entity('partner_assets')
export class Asset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({
    nullable: false,
    length: 100,
  })
  refId: string;

  @Index()
  @Column({
    length: 50,
    nullable: false,
  })
  name: string;

  @Index()
  @Column({
    length: 100,
    nullable: false,
  })
  image: string;

  @Index()
  @Column({
    nullable: false,
  })
  slug?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ManyToOne(() => Partner, (partner) => partner.assets)
  @JoinColumn({ name: 'partnerId' })
  partner?: Partner;

  @Column({
    type: 'string',
    nullable: true,
  })
  @RelationId((asset: Asset) => asset.partner)
  partnerId: string;

  @OneToMany(() => Attribute, (attribute) => attribute.assetId)
  attributes?: Array<Attribute>;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = this.generateSlug(this.name);
  }

  @BeforeUpdate()
  beforeUpdate(): void {
    this.slug = this.generateSlug(this.name);
  }

  /*
  public async saveAssetsForPartner(dtoList: Array<AssetDto>, partner: Partner): Promise<void> {
    for (const dto of dtoList) {
      try {
        const attrs: Array<Attribute> = dto.attributes.map(
          (attr: AttributeDto) => new Attribute(attr),
        );
        const asset = new Asset({
          refId: dto.refId,
          name: dto.name,
          image: dto.image,
          partner: partner,
          partnerId: partner.id,
          description: dto.description,
          attributes: attrs,
        });
        asset.partner = partner;
        await this.save(asset);
      } catch (e) {
        Logger.error(e);
        throw new InternalServerErrorException();
      }
    }
  }
  */

  constructor(partial: Partial<Asset>) {
    super();
    Object.assign(this, partial);
  }
}
