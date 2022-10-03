import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from 'modules/auth/auth.module';
import { UserTransformer } from './transformers/user.transformer';
import { OtpService } from './services/otp.service';

@Module({
  imports: [AuthModule],
  providers: [UsersService, UserTransformer, OtpService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
