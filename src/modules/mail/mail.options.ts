import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import path from 'path';
import { MailerOptions } from '@nestjs-modules/mailer';

export const getMailerTransport = (configService: ConfigService): MailerOptions => {
  return {
    transport: nodemailer.createTransport({
      host: configService.get('mailer.default.mailerHost'),
      port: parseInt(configService.get('mailer.default.mailerPort'), 10),
      secure: configService.get('mailer.default.mailerSecure') === 'true',
      auth: configService.get('mailer.default.mailerUser')
        ? {
            user: configService.get('mailer.default.mailerUser'),
            pass: configService.get('mailer.default.mailerPassword'),
          }
        : null,
    }),
    defaults: {
      from:
        configService.get('mailer.default.mailerFrom') ||
        'Notifications <notifications@jumpdemo.com>',
    },
    template: {
      dir: path.join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
