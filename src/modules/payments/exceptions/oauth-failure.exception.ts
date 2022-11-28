import { HttpException } from '@nestjs/common';
import { IPaymentsAccountErrorMessage } from '../interfaces/create-account';

export class PaymentProviderOAuthFailure extends HttpException {
  public constructor(err: IPaymentsAccountErrorMessage) {
    super(
      {
        message: 'Payment Provider OAuth Request Failed',
        status: err.http_code,
        error: err.error,
      },
      err.error_code,
    );
  }
}
