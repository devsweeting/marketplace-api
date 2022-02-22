import { BaseModel } from '../../../modules/common/entities/base.model';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { PartnerAsset } from './partner-assets.entity';

@Entity('asset_attributes')
export class AssetAttributes extends BaseModel {
  @Column({
    length: 50,
    nullable: false,
  })
  trait: string;

  @Column({
    length: 50,
    nullable: false,
  })
  value: string;

  @ManyToOne(() => PartnerAsset, (asset) => asset.attributes)
  asset: PartnerAsset;

  @RelationId((attribute: AssetAttributes) => attribute.asset)
  assetId: string;
}
