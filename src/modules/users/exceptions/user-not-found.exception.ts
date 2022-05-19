import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  public constructor() {
    super('USER_NOT_FOUND');
  }
}
