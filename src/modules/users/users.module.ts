import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'modules/auth/auth.module';
import { UserTransformer } from './transformers/user.transformer';
import { OtpService } from './services/otp.service';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { UserPortfolio } from './services/user-portfolio.service';
import { SellOrdersPurchaseService } from 'modules/sell-orders/sell-order-purchase.service';
import { PortfolioTransformer } from './transformers/portfolio.transformer';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { AttributeTransformer } from 'modules/assets/transformers/attribute.transformer';
import { StorageService } from 'modules/storage/storage.service';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { FileDownloadService } from 'modules/storage/file-download.service';

@Module({
  imports: [AuthModule],
  providers: [
    UsersService,
    UserTransformer,
    OtpService,
    UserPortfolio,
    SellOrdersService,
    SellOrdersPurchaseService,
    PortfolioTransformer,
    AttributeTransformer,
    MediaTransformer,
    StorageService,
    S3Provider,
    FileDownloadService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
