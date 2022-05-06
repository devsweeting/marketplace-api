import { NotFoundException } from '@nestjs/common';

export class WatchlistNotFoundException extends NotFoundException {
  public constructor() {
    super('WATCHLIST_NOT_FOUND');
  }
}
