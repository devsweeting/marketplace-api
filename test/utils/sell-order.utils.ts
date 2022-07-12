import { SellOrder } from 'modules/sell-orders/entities';

export const createSellOrder = (data: Partial<SellOrder>): Promise<SellOrder> => {
  const sellOrder = new SellOrder({
    fractionQty: 1,
    fractionPriceCents: 1000,
    expireTime: Date.now(),
    ...data,
  });
  return sellOrder.save();
};
