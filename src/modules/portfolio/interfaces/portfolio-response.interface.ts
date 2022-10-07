import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';

export interface IPortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  purchaseHistory: SellOrderPurchase[];
  sellOrderHistory: SellOrder[];
}
