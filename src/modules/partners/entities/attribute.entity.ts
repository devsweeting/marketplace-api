import { BaseModel } from '../../common/entities/base.model';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Asset } from './';

@Entity('asset_attributes')
export class Attribute extends BaseModel {
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

  @Column({
    length: 50,
    nullable: true,
  })
  display: string;

  @ManyToOne(() => Asset, (asset) => asset.attributes)
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @Column({
    type: 'string',
    nullable: true,
  })
  @RelationId((attribute: Attribute) => attribute.asset)
  assetId: string;

  constructor(partial: Partial<Attribute>) {
    super();
    Object.assign(this, partial);
  }
}
