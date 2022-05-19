import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';
import mailInfo from './interfaces/mailInfo.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async send({ emailTo, content, template }: mailInfo): Promise<SentMessageInfo> {
    try {
      await this.mailerService.sendMail({
        to: emailTo,
        subject: content.subject,
        template: template,
        context: { content: content },
      });
    } catch (e) {
      // TODO: Logger.error does not show the error stack
      console.log(e);
      Logger.log(`MailService.send(${emailTo})`);
      throw new BadGatewayException('Email send failed');
    }
  }
}
