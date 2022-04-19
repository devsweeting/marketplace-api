import { Contract } from 'modules/assets/entities';
import { ChainEnum } from 'modules/assets/enums/chain.enum';

export const createContract = (data: Partial<Contract>): Promise<Contract> => {
  const contract = new Contract({
    address: 'AAA',
    name: 'Contract name',
    symbol: 'C',
    description: 'text',
    chain: ChainEnum.Mainnet,
    ...data,
  });
  return contract.save();
};
