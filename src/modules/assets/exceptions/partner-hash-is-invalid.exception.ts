import { BadRequestException } from '@nestjs/common';

export class PartnerHashIsInvalidException extends BadRequestException {
  public constructor() {
    super('MUST_BE_VALID');
  }
}
