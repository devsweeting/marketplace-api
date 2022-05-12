import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { getMailerTransport } from './mail.options';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<MailerOptions> =>
        getMailerTransport(configService),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
