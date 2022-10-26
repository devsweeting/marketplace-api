import { Controller, Get, HttpStatus, Redirect, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @Redirect()
  redirectToRootUrl(): { statusCode: HttpStatus.FOUND; url: string } {
    const url = this.configService.get('common.default.redirectRootUrl');
    return { statusCode: HttpStatus.FOUND, url };
  }
}
