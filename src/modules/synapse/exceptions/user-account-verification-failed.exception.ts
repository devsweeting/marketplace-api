import { HttpException, HttpStatus } from '@nestjs/common';

export class UserSynapseAccountNotFound extends HttpException {
  public constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'User Not Found',
        message: message,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
