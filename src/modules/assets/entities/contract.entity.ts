import { Column, Entity, Index } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';

@Entity('asset_contracts')
export class Contract extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ length: 42, nullable: false })
  public address: string;

  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Index()
  @Column({ length: 12, nullable: false })
  public symbol: string;

  @Column({ length: 200, nullable: true })
  public image: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ length: 200, nullable: true })
  public externalLink: string;

  public constructor(partial: Partial<Contract>) {
    super();
    Object.assign(this, partial);
  }
}
