import { BadRequestException } from '@nestjs/common';

export class AddressVerificationFailedException extends BadRequestException {
  public constructor() {
    super('ADDRESS_VERIFICATION_FAILED');
  }
}
