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
  ],
  controllers: [AssetsController, TokensController, MediaController],
  exports: [AssetsService],
})
export class AssetsModule {}
