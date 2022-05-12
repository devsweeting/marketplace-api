import { BadRequestException } from '@nestjs/common';

export class AssetFilterLabelOverLimitException extends BadRequestException {
  public constructor() {
    super('ASSET_FILTER_LABEL_OVER_LIMIT');
  }
}
