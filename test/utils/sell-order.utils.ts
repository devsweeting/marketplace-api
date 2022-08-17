import faker from '@faker-js/faker';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';

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
