import { Asset } from 'modules/assets/entities';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';

interface PurchaseHistory {
  sellOrderPurchase: SellOrderPurchase;
  asset?: Asset;
}

export interface PortfolioResponse {
  totalCostSpentInCents: number;
  totalUnits: number;
  purchaseHistory: PurchaseHistory[];
  sellOrderHistory: SellOrder[];
}
