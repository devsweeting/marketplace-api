import { HttpException, HttpStatus } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

export class TooManyRequestException extends HttpException {
  public constructor(error?: string, message?: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: error || 'Too Many Requests',
        message: message || 'Rate limit exceeded.',
      },
      StatusCodes.TOO_MANY_REQUESTS,
    );
  }
}
