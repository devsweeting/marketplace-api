import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset, Attribute } from './entities';
import { AssetsService } from 'modules/assets/assets.service';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { AssetsController } from './controllers/assets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Attribute])],
  providers: [AssetsService, AssetsTransformer],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}