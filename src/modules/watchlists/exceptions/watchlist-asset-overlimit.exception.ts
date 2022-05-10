import { ConflictException } from '@nestjs/common';

export class WatchlistAssetOverLimitException extends ConflictException {
  public constructor() {
    super('WATCHLIST_MAX_ASSET_OVER_LIMIT');
  }
}
