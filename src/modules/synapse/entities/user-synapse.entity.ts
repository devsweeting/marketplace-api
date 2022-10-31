import { Column, Entity, JoinColumn, OneToOne, RelationId } from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Exclude } from 'class-transformer';
import { User } from 'modules/users/entities';

@Entity('user_synapse')
// @Unique('USER_EMAIL_UNIQUE', ['email'])
export class UserSynapse extends BaseModel implements IBaseEntity {
  @Column({ type: 'string', nullable: true })
  @RelationId((UserSynapse: UserSynapse) => UserSynapse.user)
  public userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user?: User;

  @Column({
    length: 24,
    nullable: true,
  })
  public userSynapseId: string;

  @Column({
    length: 25,
    nullable: true,
  })
  public depositNodeId: string;

  @Exclude()
  @Column({
    length: 250,
    nullable: true,
  })
  public refreshToken: string;

  constructor(partial: Partial<UserSynapse> = {}) {
    super();
    Object.assign(this, partial);
  }
}
