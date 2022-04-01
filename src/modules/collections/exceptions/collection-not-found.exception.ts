import { NotFoundException } from '@nestjs/common';

export class CollectionNotFoundException extends NotFoundException {
  public constructor() {
    super('COLLECTION_NOT_FOUND');
  }
}
