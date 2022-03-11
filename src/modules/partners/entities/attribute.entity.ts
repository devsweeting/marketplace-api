import { BaseModel } from '../../common/entities/base.model';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Asset } from './';

@Entity('asset_attributes')
export class Attribute extends BaseModel {
  @Column({
    length: 50,
    nullable: false,
  })
  public trait: string;

  @Column({
    length: 50,
    nullable: false,
  })
  public value: string;

  @Column({
    length: 50,
    nullable: true,
  })
  public display: string;

  @ManyToOne(() => Asset, (asset) => asset.attributes, { nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: false })
  @RelationId((attribute: Attribute) => attribute.asset)
  public assetId: string;

  public constructor(partial: Partial<Attribute>) {
    super();
    Object.assign(this, partial);
  }
}