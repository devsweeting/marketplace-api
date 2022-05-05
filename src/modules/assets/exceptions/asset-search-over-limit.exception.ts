import { BadRequestException } from '@nestjs/common';

export class AssetSearchOverLimitException extends BadRequestException {
  public constructor() {
    super('ASSET_SEARCH_OVER_LIMIT');
  }
}
