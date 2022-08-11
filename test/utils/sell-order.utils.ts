import faker from '@faker-js/faker';
import { SellOrder } from 'modules/sell-orders/entities';

export const createSellOrder = (data: Partial<SellOrder>): Promise<SellOrder> => {
  const sellOrder = new SellOrder({
    fractionQty: 1,
    fractionPriceCents: 1000,
    startTime: Date.now(),
    expireTime: faker.date.future().getTime(),
    ...data,
  });
  return sellOrder.save();
};
