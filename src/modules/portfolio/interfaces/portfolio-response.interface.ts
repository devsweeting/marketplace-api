import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';

export interface PortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  purchaseHistory: SellOrderPurchase[];
  sellOrderHistory: SellOrder[];
}
