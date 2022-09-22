import { BadRequestException } from '@nestjs/common';

export class OtpTokenInvalidException extends BadRequestException {
  public constructor() {
    super('OTP_TOKEN_INVALID');
  }
}

export class RefreshTokenInvalidException extends BadRequestException {
  public constructor() {
    super('REFRESH_TOKEN_INVALID');
  }
}
