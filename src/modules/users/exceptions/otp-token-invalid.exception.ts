import { BadRequestException } from '@nestjs/common';

export class OtpTokenInvalidException extends BadRequestException {
  public constructor() {
    super('OTP_TOKEN_INVALID');
  }
}
