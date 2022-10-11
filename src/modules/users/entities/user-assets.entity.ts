import { Asset } from 'modules/assets/entities';
import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { User } from './user.entity';

@Entity('user_assets')
export class UserAsset extends BaseModel implements IBaseEntity {
  @Column({ type: 'string', nullable: false })
  @RelationId((UserAsset: UserAsset) => UserAsset.asset)
  public assetId: string;

  @Column({ type: 'int', nullable: false })
  public quantityOwned: number;

  @Column({ type: 'string', nullable: false })
  @RelationId((UserAsset: UserAsset) => UserAsset.user)
  public userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'assetId' })
  public asset?: Asset;

  constructor(partial: Partial<UserAsset> = {}) {
    super();
    Object.assign(this, partial);
  }
}
