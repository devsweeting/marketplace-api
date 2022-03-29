import { NotFoundException } from '@nestjs/common';

export class PartnerNotFoundException extends NotFoundException {
  public constructor() {
    super('PARTNER_NOT_FOUND');
  }
}
