import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from 'typeorm';

import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from './user.entity';
import { RefreshTokenInvalidException } from '../exceptions/token-invalid.exception';
import { TokenNotFoundException } from 'modules/assets/exceptions';

@Entity('user_refresh')
export class UserRefresh extends BaseModel implements IBaseEntity {
  @Index()
  @PrimaryColumn({ nullable: false })
  public refreshToken: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({ type: 'string', nullable: true })
  @RelationId((UserRefresh: UserRefresh) => UserRefresh.user)
  public userId?: string;

  @Column({ default: false })
  public isExpired: boolean;

  static async findValidByUser(userId: string): Promise<UserRefresh[]> {
    return UserRefresh.find({
      where: { userId: userId },
    });
  }

  static async findToken(token: string): Promise<UserRefresh | undefined> {
    const userToken = await UserRefresh.findOne({
      where: { refreshToken: token },
    });
    if (!userToken) {
      throw new TokenNotFoundException();
    }
    return UserRefresh.findOne({
      where: { refreshToken: token },
    });
  }

  static async markTokenExpired(refreshToken: string): Promise<UserRefresh> {
    const token = await UserRefresh.findOne({
      where: { refreshToken },
    });

    if (!token) {
      throw new RefreshTokenInvalidException();
    }

    Object.assign(token, { isExpired: true });
    return await token.save();
  }

  constructor(partial: Partial<UserRefresh> = {}) {
    super();
    Object.assign(this, partial);
  }
}
