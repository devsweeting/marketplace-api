import { BadRequestException } from '@nestjs/common';

export class UserCannotPurchaseOwnOrderException extends BadRequestException {
  public constructor() {
    super('USER_CANNOT_PURCHASE_OWN_ORDER');
  }
}
