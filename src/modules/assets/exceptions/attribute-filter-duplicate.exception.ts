import { BadRequestException } from '@nestjs/common';

export class AttributeDuplicatedException extends BadRequestException {
  public constructor() {
    super('ATTRIBUTE_DUPLICATED');
  }
}
