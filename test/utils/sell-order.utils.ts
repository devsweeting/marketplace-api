import { faker } from '@faker-js/faker';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { User } from 'modules/users/entities';
import { UserAsset } from 'modules/users/entities/user-assets.entity';
import * as testApp from '../utils/app.utils';
import { generateToken } from './jwt.utils';

export const createSellOrder = (data: Partial<SellOrder>): Promise<SellOrder> => {
  const sellOrder = new SellOrder({
    fractionQty: 1,
    fractionPriceCents: 1000,
    startTime: faker.date.recent(),
    expireTime: faker.date.future(),
    type: SellOrderTypeEnum.standard,
    ...data,
  });
  return sellOrder.save();
};

export async function expectPurchaseSuccess(
  app: INestApplication,
  order: SellOrder,
  fractionsToPurchase: number,
  fractionPriceCents: number,
  purchaser: User,
  headers?: Record<string, string>,
  sellerUserAsset?: UserAsset,
  quantityOwned?: number,
): Promise<SellOrderPurchase> {
  const authHeaders = headers ?? headerForUser(purchaser);
  await order.reload();
  const initialQty = order.fractionQtyAvailable;
  const payload = { fractionsToPurchase, fractionPriceCents, stripeTrackingDetails: undefined };
  await testApp.post(app, urlFor(order), HttpStatus.CREATED, null, payload, authHeaders);
  await order.reload();
  if (sellerUserAsset) {
    const initialSellerAssetQty = sellerUserAsset.quantityOwned;
    await sellerUserAsset.reload();
    expect(sellerUserAsset.quantityOwned).toBe(initialSellerAssetQty - fractionsToPurchase);
  }
  expect(order.fractionQtyAvailable).toBe(initialQty - fractionsToPurchase);
  const purchase = await SellOrderPurchase.findOneBy({ sellOrderId: order.id });
  const buyerAsset = await UserAsset.findOneBy({ assetId: order.assetId, userId: purchaser.id });
  expect(purchase).toBeDefined();
  expect(purchase.fractionQty).toBe(fractionsToPurchase);
  expect(purchase.fractionPriceCents).toBe(fractionPriceCents);
  expect(buyerAsset).toBeDefined();
  expect(buyerAsset.quantityOwned).toBe(quantityOwned ?? fractionsToPurchase);
  return purchase;
}

export function urlFor(order: SellOrder): string {
  return `/v1/sellorders/${order.id}/purchase`;
}

export function headerForUser(user: User): Record<string, string> {
  return { Authorization: `Bearer ${generateToken(user)}` };
}
