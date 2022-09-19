import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { SellOrder, SellOrderPurchase } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { User } from 'modules/users/entities';
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
  headers?: any,
) {
  const authHeaders = headers ?? headerForUser(purchaser);
  await order.reload();
  const initialQty = order.fractionQtyAvailable;
  const payload = { fractionsToPurchase, fractionPriceCents };
  await testApp.post(app, urlFor(order), 201, null, payload, authHeaders);
  await order.reload();
  expect(order.fractionQtyAvailable).toBe(initialQty - fractionsToPurchase);
  const purchase = await SellOrderPurchase.findOneBy({ sellOrderId: order.id });
  expect(purchase).toBeDefined();
  expect(purchase.fractionQty).toBe(fractionsToPurchase);
  expect(purchase.fractionPriceCents).toBe(fractionPriceCents);
  return purchase;
}

export function urlFor(order: SellOrder): string {
  return `/v1/sellorders/${order.id}/purchase`;
}

export function headerForUser(user: User): Record<string, string> {
  return { Authorization: `Bearer ${generateToken(user)}` };
}
