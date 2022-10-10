import { Injectable } from '@nestjs/common';
import { BaseService } from 'modules/common/services';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { User } from 'modules/users/entities';
import { IPortfolioResponse } from 'modules/portfolio/interfaces/portfolio-response.interface';

@Injectable()
export class PortfolioService extends BaseService {
  constructor(
    private readonly sellOrderService: SellOrdersService,
    private readonly sellOrderPurchaseService: SellOrdersPurchaseService,
  ) {
    super();
  }

  public async getUserPortfolio(user: User): Promise<IPortfolioResponse> {
    const assetSellOrderHistory = await this.sellOrderService.getAssetsWithUserSellOrders(user);
    const assetPurchaseHistory = await this.sellOrderPurchaseService.getAssetsWithUserPurchases(
      user,
    );
    const { totalValueInCents, totalUnits } = await this.sellOrderPurchaseService.getTotalPurchased(
      user,
    );
    return { totalValueInCents, totalUnits, assetPurchaseHistory, assetSellOrderHistory };
  }
}
