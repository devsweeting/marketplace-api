import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './entities';
import { EventsTransformer } from './transformers/events.transformer';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventsService, EventsTransformer],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventModule {}
