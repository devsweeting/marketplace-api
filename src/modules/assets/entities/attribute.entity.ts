import { BaseModel } from '../../common/entities/base.model';
import { Column, Entity, IsNull, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Asset } from './';
import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';

@Entity('asset_attributes')
export class Attribute extends BaseModel implements BaseEntityInterface {
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
  public maxValue: string;

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

  public static findAllByAssetId(assetId: string): Promise<Attribute[]> {
    return Attribute.find({
      where: {
        assetId,
        isDeleted: false,
        deletedAt: IsNull(),
      },
    });
  }
}
