import { BadRequestException } from '@nestjs/common';

export class NotEnoughAvailableException extends BadRequestException {
  public constructor() {
    super('NOT_ENOUGH_AVAILABLE');
  }
}
