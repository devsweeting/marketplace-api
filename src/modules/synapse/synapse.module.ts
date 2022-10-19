import { Module } from '@nestjs/common';
import { SynapseController } from './controllers/synapse.controller';
import { SynapseService } from './providers/synapse.service';

@Module({
  providers: [SynapseService],
  controllers: [SynapseController],
  exports: [],
})
export class SynapseModule {}
