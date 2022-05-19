import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from '../user.entity';
import { UserLoginMetadata } from '../interfaces/user-login-metadata';

@Entity('user-logins')
export class UserLogin extends BaseModel implements BaseEntityInterface {
  @Column({
    type: 'jsonb',
  })
  metadata: UserLoginMetadata;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'string', nullable: true })
  @RelationId((userLogin: UserLogin) => userLogin.user)
  public userId?: string;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
