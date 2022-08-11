import { BadRequestException } from '@nestjs/common';

export class PriceMismatchException extends BadRequestException {
  public constructor() {
    super('PRICE_MISMATCH');
  }
}
