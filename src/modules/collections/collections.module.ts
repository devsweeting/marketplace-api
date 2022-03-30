import { Module } from '@nestjs/common';
import { CollectionsController } from './controllers/collections.controller';
import { CollectionsService } from './collections.service';
import { StorageModule } from 'modules/storage/storage.module';
import { CollectionsTransformer } from './transformers/collections.transformer';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';

@Module({
  imports: [StorageModule],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsTransformer, AssetsTransformer],
})
export class CollectionsModule {}
