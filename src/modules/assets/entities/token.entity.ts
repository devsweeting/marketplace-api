import { BaseModel } from '../../common/entities/base.model';
import { Column, Entity, Generated, JoinColumn, ManyToOne, RelationId } from 'typeorm';
import { Asset, Contract } from './';
import { Partner } from 'modules/partners/entities';

@Entity('tokens')
export class Token extends BaseModel {
  @Column({ nullable: false })
  @Generated('uuid')
  public tokenId: string;

  @Column({ nullable: false, type: 'numeric' })
  public supply: number;

  @ManyToOne(() => Asset, (asset) => asset.tokens, { nullable: false })
  @JoinColumn({ name: 'assetId', referencedColumnName: 'id' })
  public asset: Asset;

  @Column({ type: 'string', nullable: false })
  @RelationId((token: Token) => token.asset)
  public assetId: string;

  @ManyToOne(() => Partner, (partner) => partner.tokens, { nullable: false })
  @JoinColumn({ name: 'partnerId', referencedColumnName: 'id' })
  public partner: Partner;

  @Column({ type: 'string', nullable: false })
  @RelationId((token: Token) => token.partner)
  public partnerId: string;

  @ManyToOne(() => Contract, { nullable: false })
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
