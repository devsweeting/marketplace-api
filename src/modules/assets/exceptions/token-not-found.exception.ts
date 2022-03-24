import { NotFoundException } from '@nestjs/common';

export class TokenNotFoundException extends NotFoundException {
  public constructor() {
    super('TOKEN_NOT_FOUND');
  }
}
