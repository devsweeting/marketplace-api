import { BadRequestException, ForbiddenException } from '@nestjs/common';

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

export class PurchaseLimitReached extends BadRequestException {
  public constructor() {
    super(`PURCHASE_LIMIT_REACHED`);
  }
}

export class InvalidSeller extends BadRequestException {
  public constructor() {
    super(`SELLER_DOES_NOT_OWN_ASSET`);
  }
}

export class NotEnoughUnitsFromSeller extends BadRequestException {
  public constructor() {
    super('SELLER_DOES_NOT_OWN_ENOUGH_ASSETS');
  }
}
