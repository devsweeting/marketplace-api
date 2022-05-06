import { WatchlistAsset } from 'modules/watchlists/entities/watchlist-asset.entity';
import { Watchlist } from 'modules/watchlists/entities/watchlist.entity';

export const createWatchlist = (data: Partial<Watchlist>): Promise<Watchlist> => {
  const watchlist = new Watchlist({
    ...data,
  });
  return watchlist.save();
};

export const createWatchlistAsset = (data: Partial<WatchlistAsset>): Promise<WatchlistAsset> => {
  const watchlistAsset = new WatchlistAsset({
    ...data,
  });
  return watchlistAsset.save();
};
