import { BaseModel } from '../../common/entities/base.model';
import { Column, Entity, Generated, JoinColumn, ManyToOne, OneToOne, RelationId } from 'typeorm';
import { Asset, Contract } from './';

@Entity('tokens')
export class Token extends BaseModel {
  @Column({ nullable: false })
  @Generated('uuid')
  public tokenId: string;

  @OneToOne(() => Asset, (asset) => asset.token, { nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: false })
  @RelationId((token: Token) => token.asset)
  public assetId: string;

  @ManyToOne(() => Contract, (contract) => contract.tokens, { nullable: false })
  @JoinColumn({ name: 'contractId', referencedColumnName: 'id' })
  public contract: Contract;

  @Column({ type: 'string', nullable: false })
  @RelationId((token: Token) => token.contract)
  public contractId: string;

  public constructor(partial: Partial<Token> = {}) {
    super();
    Object.assign(this, partial);
  }
}
