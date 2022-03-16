import { Column, Entity, Index, Unique } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Exclude } from 'class-transformer';
import { Validate } from 'class-validator';
import { EmailValidator } from './validators/email.validator';
import { RoleEnum } from './enums/role.enum';

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

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
