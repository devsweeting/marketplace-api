import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './services/partners.service';
import { Attribute, Partner, Asset } from './entities';
import { AssetsTransformer } from 'modules/partners/transformers/assets.transformer';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Asset, Attribute])],
  providers: [PartnersService, AssetsTransformer],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
