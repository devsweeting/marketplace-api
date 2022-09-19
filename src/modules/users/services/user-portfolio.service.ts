import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { User } from '../entities';
import { PortfolioResponse } from '../interfaces/portfolio-response.interface';

@Injectable()
export class UserPortfolio extends BaseService {
  constructor(private readonly sellOrderService: SellOrdersService) {
    super();
  }

  public async getUserPurchases(user: User): Promise<PortfolioResponse> {
    const { userPurchaseDetails, userSellOrders } =
      await this.sellOrderService.returnAllUserPurchases(user);
    return this.createUserPortfolio(userPurchaseDetails, userSellOrders);
  }

  public createUserPortfolio = (sellOrderPurchaseHistory, userSellOrders): PortfolioResponse => {
    let totalValueInCents = 0;
    let totalUnits = 0;
    const purchaseHistory = [];
    const sellOrderHistory = userSellOrders ? userSellOrders : null;

    for (const sellOrderPurchase of sellOrderPurchaseHistory) {
      const purchaseTotal = sellOrderPurchase.fractionQty * sellOrderPurchase.fractionPriceCents;
      totalValueInCents += purchaseTotal;
      totalUnits += sellOrderPurchase.fractionQty;
      const purchase = { purchaseTotal, ...sellOrderPurchase };
      purchaseHistory.push(purchase);
    }

    return { totalValueInCents, totalUnits, purchaseHistory, sellOrderHistory };
  };
}
