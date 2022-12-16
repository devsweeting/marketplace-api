import { BadRequestException, HttpStatus } from '@nestjs/common';

export class IncorrectAgreementError extends BadRequestException {
  public constructor() {
    super({
      status: HttpStatus.BAD_REQUEST,
      message: 'Incorrect agreement',
    });
  }
}
