import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';
import IMailInfo from './interfaces/mailInfo.interface';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async send({ emailTo, content, template }: IMailInfo): Promise<SentMessageInfo> {
    await this.mailerService.sendMail({
      to: emailTo,
      subject: content.subject,
      template: template,
      context: { content: content },
    });
  }
}
