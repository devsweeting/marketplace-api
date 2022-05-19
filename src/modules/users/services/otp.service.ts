import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'modules/auth/auth.service';
import { TooManyRequestException } from 'modules/common/exceptions/too-many-request.exception';
import { BaseService } from 'modules/common/services';
import { MailService } from 'modules/mail/mail.service';
import { User } from 'modules/users/user.entity';
import moment from 'moment';
import { MoreThanOrEqual } from 'typeorm';
import { LoginConfirmDto, LoginRequestDto } from '../dto';
import { UserLogin, UserOtp } from '../entities';
import { OtpTokenInvalidException } from '../exceptions/otp-token-invalid.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { UsersService } from '../users.service';

@Injectable()
export class OtpService extends BaseService {
  constructor(
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  public async sendOtpToken({ email }: LoginRequestDto) {
    // find non-expired otp tokens and update expired at
    await UserOtp.update(
      { expiresAt: MoreThanOrEqual(new Date()), email },
      {
        expiresAt: new Date(),
      },
    );

    // count number of requests in last 1 hr
    const requestCountIn1Hour = await UserOtp.count({
      createdAt: MoreThanOrEqual(moment().subtract(1, 'hour').toDate()),
      email,
    });
    if (requestCountIn1Hour > this.configService.get('common.default.maxOtpRequestPerHour')) {
      throw new TooManyRequestException(
        `You cannot more than ${this.configService.get(
          'common.default.maxOtpRequestPerHour',
        )} requests in 1 hour.`,
      );
    }

    // Create a new token
    const newUserOtp = await UserOtp.create({
      email,
      token: this.createRandomToken(),
      expiresAt: moment()
        .add(parseInt(this.configService.get('common.default.otpExpireDurationInMinute')), 'minute')
        .toDate(),
    });
    await newUserOtp.save();

    return this.sendOtpEmail(newUserOtp);
  }

  public async sendOtpEmail(userOtp: UserOtp) {
    return this.mailService.send({
      emailTo: userOtp.email,
      content: {
        subject: 'Confirm the code',
        expireInHumanReadable: moment(userOtp.expiresAt).fromNow(),
        token: userOtp.token,
        host: this.configService.get('common.default.redirectRootUrl'),
      },
      template: 'user-otp',
    });
  }

  public createRandomToken() {
    let result = '';
    const length = 20;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public async markTokenUsed(token: string) {
    const otpToken = await UserOtp.findValidByToken(token);
    if (!otpToken) {
      throw new OtpTokenInvalidException();
    }

    // Update token
    otpToken.used = true;
    await otpToken.save();
    return otpToken;
  }

  public async confirmOtpToken({ token, metadata }: LoginConfirmDto) {
    const otpToken = await this.markTokenUsed(token);

    const user = await this.userService.createOrUpdateFromOtp({
      email: otpToken.email,
    });

    await UserLogin.create({
      user,
      metadata,
    }).save();

    return this.authService.generateToken(user);
  }
}
