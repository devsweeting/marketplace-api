import { Column, Entity, JoinColumn, OneToOne, RelationId, Unique } from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Exclude } from 'class-transformer';
import { User } from 'modules/users/entities';
import { IPermissionCodes, IPermissions } from '../interfaces/create-account';

@Entity('user_synapse')
@Unique('USER_ID_UNIQUE', ['userId'])
export class UserSynapse extends BaseModel implements IBaseEntity {
  @Column({ type: 'string', nullable: true })
  @RelationId((UserSynapse: UserSynapse) => UserSynapse.user)
  public userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user?: User;

  @Column({
    length: 50,
    nullable: true,
  })
  public userSynapseId: string;

  @Column({
    length: 50,
    nullable: true,
  })
  public depositNodeId: string;

  @Column({
    nullable: true,
  })
  public permission: IPermissions;

  @Column({
    nullable: true,
  })
  public permission_code: IPermissionCodes;

  @Exclude()
  @Column({
    nullable: true,
  })
  public refreshToken: string;

  static async findAccountByUser(userId: string): Promise<UserSynapse> {
    return UserSynapse.findOne({
      where: { userId: userId },
    });
  }

  constructor(partial: Partial<UserSynapse> = {}) {
    super();
    Object.assign(this, partial);
  }
}
