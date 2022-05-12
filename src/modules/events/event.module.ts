import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsTransformer } from './transformers/events.transformer';

@Module({
  providers: [EventsService, EventsTransformer],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventModule {}
