import { Controller, Get, HttpStatus, Redirect, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Redirect()
  redirectToRootUrl() {
    const url = this.configService.get('common.default.redirectRootUrl');
    return url?.length ? { statusCode: HttpStatus.FOUND, url } : this.appService.getHello();
  }
}
