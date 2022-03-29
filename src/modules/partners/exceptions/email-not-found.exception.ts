import { NotFoundException } from '@nestjs/common';

export class EmailNotFoundException extends NotFoundException {
  public constructor() {
    super('EMAIL_NOT_FOUND');
  }
}
