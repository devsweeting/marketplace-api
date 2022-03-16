import { UnauthorizedException } from '@nestjs/common';
import { ErrorEnum } from './error.enum';

export class SessionNotFoundException extends UnauthorizedException {
  constructor() {
    super(ErrorEnum.SessionNotFound);
  }
}
