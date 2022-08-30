import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './strategies/apiKey.strategy';
import { PasswordService } from './password.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtOtpStrategy } from './strategies/jwt-otp.strategy';
// import { JwtRefreshTokenStrategy } from './strategies/jwt.refreshtoken.strategy';
import { UsersService } from 'modules/users/users.service';

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
    LocalStrategy,
    JwtStrategy,
    JwtOtpStrategy,
    PasswordService,
    UsersService,
  ],
  exports: [AuthService, PasswordService, UsersService],
})
export class AuthModule {}
