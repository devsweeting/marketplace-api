import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super(
      { header: 'x-api-key', prefix: '' },
      true,
      async (apiKey: string, done: CallableFunction) => {
        const partner = await authService.validateApiKey(apiKey);

        Logger.log(`ApiKeyStrategy.validateApiKey(${apiKey}) = ${!!partner}`);

        if (!partner) {
          return done(new UnauthorizedException());
        }

        return done(null, partner);
      },
    );
  }
}
