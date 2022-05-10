import { ConflictException } from '@nestjs/common';

export class WatchlistAssetDuplicatedException extends ConflictException {
  public constructor() {
    super('WATCHLIST_ASSET_DUPLICATED');
  }
}
