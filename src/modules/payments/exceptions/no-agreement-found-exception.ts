import { BadRequestException, HttpStatus } from '@nestjs/common';

export class NoAgreementFoundError extends BadRequestException {
  public constructor() {
    super({
      status: HttpStatus.BAD_REQUEST,
      message: 'No agreement found',
    });
  }
}
