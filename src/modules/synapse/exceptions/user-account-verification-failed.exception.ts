import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAccountVerification extends HttpException {
  public constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'User Not Found',
        message: message,
      },
      429,
    );
  }
}
