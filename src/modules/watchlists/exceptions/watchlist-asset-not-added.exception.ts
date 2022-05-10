import { ConflictException } from '@nestjs/common';

export class WatchlistAssetNotAddedException extends ConflictException {
  public constructor() {
    super('WATCHLIST_ASSET_NOT_ADDED');
  }
}
