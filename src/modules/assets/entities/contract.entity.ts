import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntityInterface } from 'modules/common/entities/base.entity.interface';
import { BaseModel } from '../../common/entities/base.model';
import { ChainEnum } from 'modules/assets/enums/chain.enum';
import { Token } from './token.entity';

@Entity('asset_contracts')
export class Contract extends BaseModel implements BaseEntityInterface {
  @Index()
  @Column({ length: 42, nullable: false })
  public address: string;

  @Index()
  @Column({ length: 50, nullable: false })
  public name: string;

  @Column({ length: 200, nullable: true })
  public image: string;

  @Column({ nullable: true })
  public description: string;

  @Column({ length: 1024, nullable: true })
  public externalLink: string;

  @OneToMany(() => Token, (token) => token.contract)
  public tokens: Token[];

  @Column({
    type: 'enum',
    enum: ChainEnum,
    nullable: false,
    default: ChainEnum.Mainnet,
  })
  public chain: ChainEnum;

  public getChainValue(): number {
    switch (this.chain) {
      case ChainEnum.Mainnet:
        return 1;
      case ChainEnum.Roptsen:
        return 3;
      case ChainEnum.Rinkeby:
        return 4;
      case ChainEnum.PolygonMainnet:
        return 137;
      case ChainEnum.PolygonMumbai:
        return 80001;
    }
  }

  public constructor(partial: Partial<Contract>) {
    super();
    Object.assign(this, partial);
  }
}
