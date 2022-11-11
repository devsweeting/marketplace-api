import { Module } from '@nestjs/common';
import { SellOrdersController } from './controllers/sell-orders.controller';
import { SellOrdersPurchaseService } from './sell-order-purchase.service';
import { SellOrdersService } from './sell-orders.service';
import { SellOrdersTransformer } from './transformers/sell-orders.transformer';

@Module({
  controllers: [SellOrdersController],
  providers: [SellOrdersService, SellOrdersTransformer, SellOrdersPurchaseService],
})
export class SellOrdersModule {}
