import { BadRequestException } from '@nestjs/common';

export class AssetFilterAttributeOverLimitException extends BadRequestException {
  public constructor() {
    super('ASSET_FILTER_ATTRIBUTE_OVER_LIMIT');
  }
}
