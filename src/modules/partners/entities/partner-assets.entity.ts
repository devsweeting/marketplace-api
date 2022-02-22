import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  RelationId,
  ManyToOne,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../../modules/common/entities/base.model';
import { AssetAttributes } from './attributes.entity';
import { Partner } from './partner.entity';

@Entity('partner_assets')
export class PartnerAsset extends BaseModel implements BaseEntityInterface {
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
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ManyToOne(() => Partner, (partner) => partner.assets)
  partner: Partner;

  @RelationId((asset: PartnerAsset) => asset.partner)
  partnerId?: string;

  @OneToMany(() => AssetAttributes, (attribute) => attribute.assetId)
  attributes?: Array<AssetAttributes>;

  @BeforeInsert()
  beforeInsert(): void {
    this.slug = this.generateSlug(this.name);
  }

  @BeforeUpdate()
  beforeUpdate(): void {
    this.slug = this.generateSlug(this.name);
  }

  constructor(partial: Partial<PartnerAsset>) {
    super();
    Object.assign(this, partial);
  }
}
