import { Asset } from 'modules/assets/entities';

export interface IPortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  assetPurchaseHistory: Asset[];
  assetSellOrderHistory: Asset[];
}
