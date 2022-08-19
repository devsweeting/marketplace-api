import { BadRequestException } from '@nestjs/common';

export { SellOrderNotFoundException } from './sell-order-not-found.exception';
export { NotEnoughAvailableException } from './not-enough-available.exception';
export { PriceMismatchException } from './price-mismatch.exception';
export { UserCannotPurchaseOwnOrderException } from './user-cannot-purchase-own-order.exception';

export class InvalidUserFractionLimitException extends BadRequestException {
  public constructor(msg: string) {
    super(`INVALID_USER_FRACTION_LIMIT: ${msg}`);
  }
}

export class InvalidUserFractionLimitEndTimeException extends BadRequestException {
  public constructor(msg: string) {
    super(`INVALID_USER_FRACTION_LIMIT_END_TIME: ${msg}`);
  }
}

export class NotEnoughFractionsForSellOrderException extends BadRequestException {
  public constructor() {
    super(`NOT_ENOUGH_FRACTIONS_FOR_SELL_ORDER`);
  }
}
