import { HttpException, HttpStatus } from '@nestjs/common';

export class UserPaymentsAccountNotFound extends HttpException {
  public constructor(message?: string) {
    super(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Payments Account Not Found',
        message: message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
