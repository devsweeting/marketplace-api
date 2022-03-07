import { BeforeInsert, Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Asset } from './';

@Entity('partners')
export class Partner extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({
    length: 50,
    nullable: false,
  })
  name: string;

  @Index()
  @Column({
    length: 32,
    nullable: false,
  })
  apiKey: string;

  @OneToMany(() => Asset, (asset) => asset.partnerId)
  assets: Asset[];

  @BeforeInsert()
  beforeInsert(): void {
    if (this.apiKey === undefined) {
      this.apiKey = this.generateApiKey(32);
    }
  }

  generateApiKey(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  constructor(partial: Partial<Partner>) {
    super();
    Object.assign(this, partial);
  }
}
