import { BadRequestException, HttpStatus } from '@nestjs/common';

export class FormValidationError extends BadRequestException {
  public constructor(errors?: Record<string, string[]>) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Form errors',
      error: errors,
    });
  }
}
