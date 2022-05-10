import { BadRequestException } from '@nestjs/common';

export class IsNotUuidException extends BadRequestException {
  public constructor() {
    super('MUST_BE_UUID');
  }
}
