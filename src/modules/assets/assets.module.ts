import { Module } from '@nestjs/common';
import { AssetsService } from 'modules/assets/assets.service';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { AssetsController } from './controllers/assets.controller';
import { StorageModule } from 'modules/storage/storage.module';
import { TokensService } from './services/token.service';
import { TokensController } from './controllers/token.controller';
import { TokensTransformer } from './transformers/tokens.transformer';
import { AssetSubscriber } from './subscribers/after-insert';

@Module({
  imports: [StorageModule],
  providers: [AssetsService, AssetsTransformer, TokensService, TokensTransformer, AssetSubscriber],
  controllers: [AssetsController, TokensController],
  exports: [AssetsService],
})
export class AssetsModule {}
