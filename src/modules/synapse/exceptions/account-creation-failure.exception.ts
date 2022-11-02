import { HttpException, HttpStatus } from '@nestjs/common';

export class SynapseAccountCreationFailed extends HttpException {
  public constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Couldnt create user Synapse account',
        message: message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
