import { Asset } from 'modules/assets/entities';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';

interface PurchaseHistory {
  purchaseTotal: number;
  sellOrderPurchase: SellOrderPurchase;
  asset?: Asset;
}

export interface PortfolioResponse {
  totalValueInCents: number;
  totalUnits: number;
  purchaseHistory: PurchaseHistory[];
  sellOrderHistory: SellOrder[];
}
