import { Module } from '@nestjs/common';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { PortfolioTransformer } from '../portfolio/portfolio.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { StorageService } from 'modules/storage/storage.service';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { FileDownloadService } from 'modules/storage/file-download.service';
import { PortfolioService } from './portfolio.service';
import { StorageModule } from 'modules/storage/storage.module';
import { PortfolioController } from './controllers/portfolio.controller';

@Module({
  imports: [StorageModule],
  providers: [
    PortfolioService,
    SellOrdersService,
    SellOrdersPurchaseService,
    PortfolioTransformer,
    AttributeTransformer,
    MediaTransformer,
    StorageService,
    S3Provider,
    FileDownloadService,
  ],
  controllers: [PortfolioController],
  exports: [],
})
export class PortfolioModule {}
