import { NotAcceptableException } from '@nestjs/common';

export class SellOrderExpiredException extends NotAcceptableException {
  public constructor() {
    super('SELL_ORDER_EXPIRED');
  }
}
