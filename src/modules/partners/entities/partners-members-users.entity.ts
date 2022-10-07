import { IBaseEntity } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { User } from 'modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Partner } from './partner.entity';

@Entity('partners_members_users')
export class PartnerMemberUser extends BaseModel implements IBaseEntity {
  @Column()
  public partnerId: string;

  @Column()
  public userId: string;

  @ManyToOne(() => User, (user) => user.partnerMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @ManyToOne(() => Partner, (partner) => partner.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'partnerId' })
  public partner: Partner;
}
