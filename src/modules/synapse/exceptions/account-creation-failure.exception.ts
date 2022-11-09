import { HttpException, HttpStatus } from '@nestjs/common';
import { ISynapseErrorMessage } from '../interfaces/create-account';

export class SynapseAccountCreationFailed extends HttpException {
  public constructor(message?: ISynapseErrorMessage) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Couldnt create user Synapse account',
        message: message?.error.en,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
