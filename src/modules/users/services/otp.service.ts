import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { addMinutes, formatDistance, formatDistanceToNow, subHours } from 'date-fns';
import { AuthService } from 'modules/auth/auth.service';
import { TooManyRequestException } from 'modules/common/exceptions/too-many-request.exception';
import { BaseService } from 'modules/common/services';
import { MailService } from 'modules/mail/mail.service';
import { MoreThanOrEqual } from 'typeorm';
import { LoginConfirmDto, LoginRequestDto } from '../dto';
import { UserLogin, UserOtp } from '../entities';
import { OtpTokenInvalidException } from '../exceptions/token-invalid.exception';
import { UsersService } from '../users.service';
import { v4 } from 'uuid';
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
      where: { createdAt: MoreThanOrEqual(subHours(new Date(), 1)) },
    });

    if (requestCountIn1Hour > this.configService.get('common.default.maxOtpRequestPerHour')) {
      throw new TooManyRequestException(
        `You cannot more than ${this.configService.get(
          'common.default.maxOtpRequestPerHour',
        )} requests in 1 hour.`,
      );
    }

    // Create a new token
    const newUserOtp = UserOtp.create({
      email,
      token: v4(),
      expiresAt: addMinutes(
        new Date(),
        parseInt(this.configService.get('common.default.otpExpireDurationInMinute')),
      ),
    });
    await newUserOtp.save();

    return this.sendOtpEmail(newUserOtp);
  }

  public async sendOtpEmail(userOtp: UserOtp) {
    return this.mailService.send({
      emailTo: userOtp.email,
      content: {
        subject: 'Your login information',
        expireInHumanReadable: formatDistanceToNow(new Date(userOtp.expiresAt), {
          addSuffix: true,
        }),
        token: userOtp.token,
        host: this.configService.get('common.default.redirectRootUrl'),
      },
      template: 'user-otp',
    });
  }

  public async markTokenUsed(token: string) {
    const otpToken = await UserOtp.findValidByToken(token);
    if (!otpToken) {
      throw new OtpTokenInvalidException();
    }

    // Update token
    Object.assign(otpToken, { used: true });
    return await otpToken.save();
  }

  public async confirmUserLogin({ token, metadata }: LoginConfirmDto) {
    const otpToken = await this.markTokenUsed(token);

    const user = await this.userService.createOrUpdateFromOtp({
      email: otpToken.email,
    });

    await UserLogin.create({
      user,
      metadata,
    }).save();

    return await this.authService.createLoginTokens(user);
  }
}
