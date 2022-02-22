import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../../modules/common/entities/base.model';
import { PartnerAsset } from './partner-assets.entity';

@Entity('partners')
export class Partner extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({
    length: 50,
    nullable: false,
  })
  name: string;

  @OneToMany(() => PartnerAsset, (asset) => asset.partnerId)
  assets: PartnerAsset[];
}
