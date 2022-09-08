import { Column, Entity, Index, MoreThanOrEqual } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';

@Entity('user_otps')
export class UserOtp extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ nullable: false })
  public email: string;

  @Column({ nullable: false })
  public token: string;

  @Column({ nullable: false, type: 'timestamp' })
  public expiresAt: Date;

  @Column({ default: false })
  public used: boolean;

  static async findValidByToken(token: string): Promise<UserOtp> {
    return UserOtp.findOne({
      where: { token, expiresAt: MoreThanOrEqual(new Date()), used: false },
    });
  }

  constructor(partial: Partial<UserOtp> = {}) {
    super();
    Object.assign(this, partial);
  }
}
