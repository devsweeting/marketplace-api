import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestException extends HttpException {
  public constructor(error?: string, message?: string) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: error || 'Too Many Requests',
        message: message || 'Rate limit exceeded.',
      },
      429,
    );
  }
}
