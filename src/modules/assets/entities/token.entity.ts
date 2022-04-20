import { BaseModel } from '../../common/entities/base.model';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
  RelationId,
} from 'typeorm';
import { Asset, Contract } from './';

@Entity('tokens')
export class Token extends BaseModel {
  @Column({ nullable: false })
  @Generated('uuid')
  public tokenId: string;

  @Column({ nullable: false, type: 'numeric' })
  public supply: number;

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

  public isNFT(): boolean {
    return this.supply == 1;
  }

  public constructor(partial: Partial<Token>) {
    super();
    Object.assign(this, partial);
  }
}
