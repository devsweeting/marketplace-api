import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'modules/auth/auth.module';
import { UserTransformer } from './transformers/user.transformer';
import { OtpService } from './services/otp.service';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { UserPortfolio } from './services/user-portfolio.service';

@Module({
  imports: [AuthModule],
  providers: [UsersService, UserTransformer, OtpService, UserPortfolio, SellOrdersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
