import { Injectable } from '@nestjs/common';
import { Watchlist } from '../entities/watchlist.entity';
import { WatchlistResponse } from '../interfaces/watchlist.interface';

@Injectable()
export class WatchlistTransformer {
  public transform(watchlist: Watchlist): WatchlistResponse {
    return {
      assets: watchlist ? watchlist.watchlistAssets.map((el) => el.id) : [],
    };
  }
}
