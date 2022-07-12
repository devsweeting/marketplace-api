import { Module } from '@nestjs/common';
import { SellOrdersController } from './controllers/sell-orders.controller';
import { SellOrdersService } from './sell-orders.service';
import { SellOrdersTransformer } from './transformers/sell-orders.transformer';

@Module({
  controllers: [SellOrdersController],
  providers: [SellOrdersService, SellOrdersTransformer],
})
export class SellOrdersModule {}
