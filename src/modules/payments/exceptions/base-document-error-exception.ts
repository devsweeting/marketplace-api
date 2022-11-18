import { BadRequestException, HttpStatus } from '@nestjs/common';

export class BaseDocumentError extends BadRequestException {
  public constructor(errors?: Record<string, string[]>) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'No documents found to be updated',
      error: errors,
    });
  }
}
