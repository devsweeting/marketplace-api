import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './services/partners.service';
import { AssetAttributes, Partner, PartnerAsset } from './entities';
import { PartnerRepository } from './repositories/partner.repository';
import { PartnerAssetRepository } from './repositories/partner.asset.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partner,
      PartnerAsset,
      AssetAttributes,
      PartnerRepository,
      PartnerAssetRepository,
    ]),
  ],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService, TypeOrmModule],
})
export class PartnersModule {}
