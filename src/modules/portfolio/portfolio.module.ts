import { Module } from '@nestjs/common';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { PortfolioTransformer } from './transformers/portfolio.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { PortfolioService } from './portfolio.service';
import { StorageModule } from 'modules/storage/storage.module';
import { PortfolioController } from './controllers/portfolio.controller';
import { SellOrdersTransformer } from 'modules/sell-orders/transformers/sell-orders.transformer';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { AssetsService } from 'modules/assets/services/assets.service';
import { MediaService } from 'modules/assets/services/media.service';
import { UserAssetTransformer } from 'modules/users/transformers/user-asset.transformer';

@Module({
  imports: [StorageModule],
  providers: [
    AssetsService,
    MediaService,
    PortfolioService,
    SellOrdersService,
    SellOrdersPurchaseService,
    PortfolioTransformer,
    AttributeTransformer,
    MediaTransformer,
    SellOrdersTransformer,
    AssetsTransformer,
    UserAssetTransformer,
  ],
  controllers: [PortfolioController],
  exports: [],
})
export class PortfolioModule {}
