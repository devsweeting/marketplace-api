import { NotFoundException } from '@nestjs/common';

export class MediaNotFoundException extends NotFoundException {
  public constructor() {
    super('MEDIA_NOT_FOUND');
  }
}
