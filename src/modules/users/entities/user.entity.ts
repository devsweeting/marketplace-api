import { Column, Entity, Index, OneToMany, OneToOne, Unique } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Exclude } from 'class-transformer';
import { Validate } from 'class-validator';
import { EmailValidator } from '../validators/email.validator';
import { RoleEnum } from '../enums/role.enum';
import { PartnerMemberUser } from '../../partners/entities/partners-members-users.entity';
import { Watchlist } from '../../watchlists/entities/watchlist.entity';

@Entity('users')
@Unique('USER_EMAIL_UNIQUE', ['email'])
export class User extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false })
  @Validate(EmailValidator)
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  public password: string;

  @Column({
    length: 50,
    nullable: true,
  })
  public firstName: string;

  @Column({
    length: 50,
    nullable: true,
  })
  public lastName: string;

  @Column({
    length: 150,
    nullable: true,
  })
  public address: string;

  @Column({
    length: 150,
    nullable: true,
  })
  public nonce: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  public refreshToken?: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    nullable: false,
    default: RoleEnum.USER,
  })
  public role: RoleEnum;

  @Column({
    nullable: true,
  })
  public refId: string;

  @OneToMany(() => PartnerMemberUser, (partnerMemberUser) => partnerMemberUser.user)
  public partnerMembers: PartnerMemberUser[];

  @OneToOne(() => Watchlist, (watchlist) => watchlist.user, { nullable: true })
  public watchlist: Watchlist | null;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
