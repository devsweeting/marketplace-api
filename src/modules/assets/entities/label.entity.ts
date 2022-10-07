import { Column, Entity, Index, IsNull, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { Asset } from 'modules/assets/entities/asset.entity';

@Entity('asset_labels')
export class Label extends BaseModel implements IBaseEntity {
  @Index()
  @Column({ length: 100, nullable: false })
  public name: string;

  @Index()
  @Column({ length: 100, nullable: false })
  public value: string;

  @ManyToOne(() => Asset, (asset) => asset.attributes, { nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: false })
  @RelationId((label: Label) => label.asset)
  public assetId: string;

  public static findAllByAssetId(assetId: string): Promise<Label[]> {
    return Label.find({
      where: {
        assetId,
        isDeleted: false,
        deletedAt: IsNull(),
      },
    });
  }

  public constructor(partial: Partial<Label> = {}) {
    super();
    Object.assign(this, partial);
  }
}
