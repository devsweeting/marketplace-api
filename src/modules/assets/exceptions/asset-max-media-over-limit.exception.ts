import { ConflictException } from '@nestjs/common';

export class AssetMaxMediaOverLimitException extends ConflictException {
  public constructor() {
    super('MAX_MEDIA_OVER_LIMIT');
  }
}
