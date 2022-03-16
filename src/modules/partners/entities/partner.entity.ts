import { BeforeInsert, Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Asset } from 'modules/assets/entities';

@Entity('partners')
export class Partner extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({
    length: 50,
    nullable: false,
  })
  public name: string;

  @Index()
  @Column({
    length: 32,
    nullable: false,
  })
  public apiKey: string;

  @OneToMany(() => Asset, (asset) => asset.partnerId)
  public assets: Asset[];

  @BeforeInsert()
  public beforeInsert(): void {
    if (this.apiKey === undefined) {
      this.apiKey = this.generateApiKey(32);
    }
  }

  public generateApiKey(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public constructor(partial: Partial<Partner>) {
    super();
    Object.assign(this, partial);
  }
}
