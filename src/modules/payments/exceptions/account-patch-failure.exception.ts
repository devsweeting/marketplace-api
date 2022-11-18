import { HttpException, HttpStatus } from '@nestjs/common';
import { IPaymentsAccountErrorMessage } from '../interfaces/create-account';

export class AccountPatchError extends HttpException {
  public constructor(message?: IPaymentsAccountErrorMessage) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Could not patch user payment account',
        message: message?.error.en,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
