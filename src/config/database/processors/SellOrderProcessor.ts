import faker from '@faker-js/faker';
import { SellOrder } from 'modules/sell-orders/entities';
import { IProcessor } from 'typeorm-fixtures-cli';

export default class SellOrderProcessor implements IProcessor<SellOrder> {
  preProcess(name: string, object: any): any {
    return { ...object };
  }

  postProcess(name: string, obj: { [key: string]: any }): void {
    obj.fractionQty = faker.datatype.number({ min: 10000, max: 100000 });
    obj.fractionQtyAvailable = faker.datatype.number({ min: 0, max: obj.fractionQty });

    const dollars = faker.datatype.number({ min: 1, max: 100 });
    obj.fractionPriceCents = dollars * 100;

    obj.startTime = faker.date.past().getTime();
    obj.expireTime = faker.date.future().getTime();
  }
}
