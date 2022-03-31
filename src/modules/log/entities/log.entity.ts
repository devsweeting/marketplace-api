import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { User } from 'modules/users/user.entity';

@Entity('logs')
export class Log extends BaseModel implements BaseEntityInterface {
  @Column({ length: 128, nullable: false })
  public action: string;

  @Column({ length: 128, nullable: false })
  public resource: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  public user: User;

  @Column({ type: 'string', nullable: false })
  @RelationId((log: Log) => log.user)
  public userId: string;

  @Column({ length: 128, nullable: false })
  public recordId: string;

  @Column({ length: 128, nullable: false })
  public recordTitle: string;

  @Column({ type: 'json', nullable: true })
  public difference: object | null;

  public constructor(partial: Partial<Log>) {
    super();
    Object.assign(this, partial);
  }
}
