import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategies/apiKey.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtOtpStrategy } from './strategies/jwt-otp.strategy';
import { UsersService } from 'modules/users/users.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.default.jwtSecret'),
        signOptions: {
          expiresIn: `${configService.get('jwt.default.jwtExpiresIn')}s`,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    ApiKeyStrategy,
    JwtStrategy,
    JwtOtpStrategy,
    UsersService,
    JwtRefreshStrategy,
  ],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
