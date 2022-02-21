import { Entity, Column, Index, BeforeInsert, BeforeUpdate } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';

@Entity('partner_assets')
export class PartnerAsset extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({
    nullable: false,
    length: 100,
  })
  public refId: string;

  @Index()
  @Column({
    length: 50,
    nullable: false,
  })
  public name: string;

  @Index()
  @Column({
    length: 100,
    nullable: false,
  })
  public image: string;

  @Index()
  @Column({
    nullable: false,
  })
  public slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  public description: string;

  // @Column({
  //   type: 'json',

  // })
  // public attributes: Array<>;

  @BeforeInsert()
  public beforeInsert(): void {
    this.slug = this.generateSlug(this.name);
  }

  @BeforeUpdate()
  public beforeUpdate(): void {
    this.slug = this.generateSlug(this.name);
  }

  constructor(partial: Partial<PartnerAsset>) {
    super();
    Object.assign(this, partial);
  }
}
