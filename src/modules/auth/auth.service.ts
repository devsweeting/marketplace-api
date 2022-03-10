import { Injectable, Logger } from '@nestjs/common';
import { Partner } from 'modules/partners/entities';

@Injectable()
export class AuthService {
  public validateApiKey(apiKey: string): Promise<Partner | null> {
    Logger.log(`AuthService.validateApiKey(${apiKey})`);
    return Partner.findOne({ where: { apiKey } });
  }
}
