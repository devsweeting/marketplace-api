import { Module } from '@nestjs/common';
import { WatchlistTransformer } from './transformers/watchlist.transformer';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  providers: [WatchlistService, WatchlistTransformer],
  controllers: [WatchlistController],
  exports: [],
})
export class WatchlistsModule {}
