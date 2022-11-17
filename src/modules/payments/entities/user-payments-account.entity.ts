import { Column, Entity, JoinColumn, OneToOne, RelationId, Unique } from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Exclude } from 'class-transformer';
import { User } from 'modules/users/entities';
import { IPermissionCodes, IPermissions } from '../interfaces/create-account';

@Entity('user_payments_account')
@Unique('USER_ID_UNIQUE', ['userId'])
export class UserPaymentsAccount extends BaseModel implements IBaseEntity {
  @Column({ type: 'string', nullable: true })
  @RelationId((UserPaymentsAccount: UserPaymentsAccount) => UserPaymentsAccount.user)
  public userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user?: User;

  @Column({
    length: 50,
    nullable: true,
  })
  public userAccountId: string;

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
  public permissionCode: IPermissionCodes;

  @Exclude()
  @Column({
    nullable: true,
  })
  public refreshToken: string;

  @Exclude()
  @Column({
    nullable: true,
  })
  public oauthKey: string;

  @Exclude()
  @Column({
    nullable: true,
    type: 'timestamp',
  })
  public oauthKeyExpiresAt: Date;

  static async findAccountByUser(userId: string): Promise<UserPaymentsAccount> {
    return UserPaymentsAccount.findOne({
      where: { userId: userId },
    });
  }

  constructor(partial: Partial<UserPaymentsAccount> = {}) {
    super();
    Object.assign(this, partial);
  }
}
