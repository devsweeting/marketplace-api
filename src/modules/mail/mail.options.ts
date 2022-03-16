import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const getMailerTransport = (configService: ConfigService): any => {
  return {
    ...nodemailer.createTransport({
      host: configService.get('mailer.default.mailerHost'),
      port: parseInt(configService.get('mailer.default.mailerPort'), 10),
      secure: configService.get('mailer.default.mailerSecure') === 'true',
      auth: {
        user: configService.get('mailer.default.mailerUser'),
        pass: configService.get('mailer.default.mailerPassword'),
      },
    }),
    defaults: {
      from:
        configService.get('mailer.default.mailerFrom') ||
        'Notifications <notifications@jumpdemo.com>',
    },
    template: {
      dir: __dirname + '/templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
