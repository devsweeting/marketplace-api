import { NotFoundException } from '@nestjs/common';

export class SellOrderNotFoundException extends NotFoundException {
  public constructor() {
    super('SELL_ORDER_NOT_FOUND');
  }
}
