import { Module } from '@nestjs/common';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { StorageModule } from 'modules/storage/storage.module';
import { WatchlistTransformer } from './transformers/watchlist.transformer';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [StorageModule],
  providers: [WatchlistService, WatchlistTransformer, AttributeTransformer, MediaTransformer],
  controllers: [WatchlistController],
  exports: [],
})
export class WatchlistsModule {}
