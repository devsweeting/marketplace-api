import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from 'modules/common/entities/base.model';
import { Asset } from 'modules/assets/entities';
import { User } from 'modules/users/entities/user.entity';
import { PartnerMemberUser } from 'modules/partners/entities';
import { Token } from 'modules/assets/entities/token.entity';
import { File } from 'modules/storage/entities/file.entity';

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

  @Column({ nullable: false })
  public accountOwnerId: string;

  @OneToOne(() => User)
  @JoinColumn({ referencedColumnName: 'id' })
  public accountOwner: User;

  @OneToMany(() => PartnerMemberUser, (partnerMemberUser) => partnerMemberUser.partner)
  public members: [];

  @OneToMany(() => Asset, (asset) => asset.partnerId)
  public assets: Asset[];

  @OneToMany(() => Token, (token) => token.asset.partner)
  public tokens: Token[];

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'bannerId' })
  public banner?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((partner: Partner) => partner.banner)
  public bannerId?: string;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'logoId' })
  public logo?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((partner: Partner) => partner.logo)
  public logoId?: string;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'avatarId' })
  public avatar?: File;

  @Column({ type: 'string', nullable: true })
  @RelationId((partner: Partner) => partner.avatar)
  public avatarId?: string;

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
