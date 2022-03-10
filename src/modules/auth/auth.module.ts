import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './apiKey.strategy';
import { PasswordService } from './password.service';

@Module({
  imports: [PassportModule],
  providers: [AuthService, ApiKeyStrategy, PasswordService],
  exports: [PasswordService],
})
export class AuthModule {}
