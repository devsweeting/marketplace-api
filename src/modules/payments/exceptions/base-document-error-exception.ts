import { BadRequestException, HttpStatus } from '@nestjs/common';

export class BaseDocumentError extends BadRequestException {
  public constructor(errors?: Record<string, string[]>) {
    super({
      status: HttpStatus.BAD_REQUEST,
      message: 'Could not find document to update',
      error: errors,
    });
  }
}
