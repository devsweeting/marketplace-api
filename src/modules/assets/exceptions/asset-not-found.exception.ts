import { NotFoundException } from '@nestjs/common';

export class AssetNotFoundException extends NotFoundException {
  public constructor() {
    super('ASSET_NOT_FOUND');
  }
}
