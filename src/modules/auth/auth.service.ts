import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  // KEYS
  private apiKeys: string[] = [
    'ca03na188ame03u1d78620de67282882a84',
    'd2e621a6646a4211768cd68e26f21228a81',
  ];
  validateApiKey(apiKey: string): boolean {
    Logger.log(`AuthService.validateApiKey(${apiKey})`);
    return true;
    // return this.apiKeys.find((apiK) => {
    //   Logger.log(`${apiKey} === ${apiK}`);
    //   return apiKey == apiK;
    // });
  }
}
