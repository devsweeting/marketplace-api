import { HttpException, HttpStatus } from '@nestjs/common';
import { IPaymentsAccountErrorMessage } from '../interfaces/create-account';

export class PaymentsAccountCreationFailed extends HttpException {
  public constructor(message?: IPaymentsAccountErrorMessage) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Couldnt create user payments account',
        message: message?.error.en,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
