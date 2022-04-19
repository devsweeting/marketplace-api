import { BadRequestException } from '@nestjs/common';

export class AttributeLteMustBeGreaterThanGteException extends BadRequestException {
  public constructor() {
    super('ATTRIBUTE_LTE_MUST_BE_GREATER_THAN_GTE');
  }
}
