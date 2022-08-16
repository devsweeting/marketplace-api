import { Module } from '@nestjs/common';
import { AssetsService } from 'modules/assets/services/assets.service';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { AssetsController } from './controllers/assets.controller';
import { StorageModule } from 'modules/storage/storage.module';
import { TokensService } from './services/token.service';
import { TokensController } from './controllers/token.controller';
import { TokensTransformer } from './transformers/tokens.transformer';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { MediaService } from './services/media.service';
import { MediaController } from './controllers/media.controller';
import { MediaTransformer } from './transformers/media.transformer';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';
import { TrendingController } from './controllers/trending.controller';

@Module({
  imports: [StorageModule],
  providers: [
    AssetsService,
    AssetsTransformer,
    TokensService,
    TokensTransformer,
    AttributeTransformer,
    MediaService,
    MediaTransformer,
    SellOrdersTransformer,
  ],
  controllers: [AssetsController, TokensController, MediaController, TrendingController],
  exports: [AssetsService, AttributeTransformer, MediaTransformer],
})
export class AssetsModule {}
