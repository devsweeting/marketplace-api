import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super({ header: 'x-api-key', prefix: '' }, true, (apikey: string, done) => {
      const checkKey = authService.validateApiKey(apikey);
      Logger.log(`ApiKeyStrategy.validateApiKey(${apikey}) = ${checkKey}`);
      return done(checkKey);
    });
  }
}
