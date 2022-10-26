/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { faker } from '@faker-js/faker';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderTypeEnum } from 'modules/sell-orders/enums/sell-order-type.enum';
import { IProcessor } from 'typeorm-fixtures-cli';

export default class SellOrderProcessor implements IProcessor<SellOrder> {
  preProcess(_name: string, object: any): any {
    return { ...object };
  }

  postProcess(_name: string, obj: { [key: string]: any }): void {
    obj.fractionQty = faker.datatype.number({ min: 10000, max: 100000 });
    obj.fractionQtyAvailable = faker.datatype.number({ min: 0, max: obj.fractionQty });

    const dollars = faker.datatype.number({ min: 1, max: 100 });
    // eslint-disable-next-line no-magic-numbers
    obj.fractionPriceCents = dollars * 100;

    obj.startTime = faker.date.past();
    obj.expireTime = faker.date.future();

    obj.type = faker.helpers.arrayElement([SellOrderTypeEnum.standard, SellOrderTypeEnum.drop]);
    if (obj.type === SellOrderTypeEnum.drop) {
      obj.userFractionLimit = 1000;
      obj.userFractionLimitEndTime = faker.date.future();
    }
  }
}
