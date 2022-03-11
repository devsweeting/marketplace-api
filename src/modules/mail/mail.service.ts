import { Injectable, BadGatewayException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';
import mailInfo from './interfaces/mailInfo.interface';
import { MESSAGES_AUTHOR } from './mail.options';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async send({ emailTo, content, template }: mailInfo): Promise<SentMessageInfo> {
    try {
      await this.mailerService.sendMail({
        from: MESSAGES_AUTHOR,
        to: emailTo,
        subject: content.subject,
        template: template,
        context: { content: content },
      });
    } catch (e) {
      Logger.log(`MailService.send(${emailTo})`);
      throw new BadGatewayException('Email send failed');
    }
  }
}
