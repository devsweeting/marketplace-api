import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './providers/payments.service';

@Module({
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [],
})
export class PaymentsModule {}
