import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Partner } from 'modules/partners/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/entities/user.entity';
import { PasswordService } from './password.service';
import { IsNull } from 'typeorm';
import * as ethUtil from 'ethereumjs-util'; //Project has been moved -> https://github.com/ethereumjs/ethereumjs-util;
import { UsersService } from 'modules/users/users.service';
import bcrypt from 'bcryptjs';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

// NOTE - There properties are the full claim that we passed into signAsync earlier, It will return the exact same values that were embedded when the token was signed.
export interface RefreshTokenPayload {
  email: string;
  id: string;
  role: RoleEnum;
  iat: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private userRepository: UsersService,
    private configService: ConfigService,
  ) {}

  public validateApiKey(apiKey: string): Promise<Partner | null> {
    return Partner.findOne({ where: { apiKey, isDeleted: false, deletedAt: IsNull() } });
  }

  public generateOtpToken(user: { id: string; email: string; role: RoleEnum }): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  public async generateAccessToken(user: { id: string; address: string; role: RoleEnum }) {
    return this.jwtService.sign({
      id: user.id,
      address: user.address, //this was address before
      role: user.role,
    });
  }

  //should the above also look like this
  public async generateRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role };

    //ERROR ENV variables not importing with configService
    //
    // console.log('JWT_REFRESH_SECRET', this.configService.get('jwt.default.jwtRefreshSecret'));
    // const refreshToken = await this.jwtService.sign(payload, {
    //   secret: this.configService.get('jwt.default.jwtRefreshSecret'),
    //   expiresIn: `${this.configService.get('jwt.default.jwtRefreshExpiresIn')}s`, //ERROR --> "expiresIn" should be a number of seconds or string representing a timespan
    // });

    const refreshToken = await this.jwtService.sign(payload, {
      secret: 'deftest',
      expiresIn: `604800s`, //ERROR --> "expiresIn" should be a number of seconds or string representing a timespan
    });
    console.log('refreshToken', refreshToken);
    return refreshToken;
  }

  async updateRefreshTokenInUser(hashedRefreshToken: string, email: string) {
    const user = await User.findOne({
      where: { email, isDeleted: false, deletedAt: null },
    });
    user.refreshToken = hashedRefreshToken;
    await user.save();
  }

  async getNewOtpTokenAndRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const refreshToken = await this.generateRefreshToken(payload);
    // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.updateRefreshTokenInUser(refreshToken, payload.email);

    return {
      otpToken: await this.generateOtpToken(payload),
      refreshToken: refreshToken,
    };
  }

  public async createAccessTokenFromRefreshToken(
    refresh_token: string,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.resolveRefreshToken(refresh_token);
    console.log('user from resolved token', user);

    const accessToken = await this.generateAccessToken(user);
    //I think this is failing because I should send an OTP token
    //Could just retrun the same funciton as login/confirm instead
    console.log('newly generated accessToken', accessToken);

    return { user, accessToken };
  }

  public async resolveRefreshToken(refresh_token: string): Promise<User> {
    const payload = await this.decodeRefreshToken(refresh_token);
    console.log('resolveRefreshToken decoded', payload);
    const userId = payload.id.toString();

    if (!userId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user;
  }

  private async decodeRefreshToken(hashedToken: string): Promise<any> {
    try {
      const refreshToken = this.jwtService.decode(hashedToken);
      return refreshToken;
      //could add checks for expiration here
      //something like the below
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }
  //not used
  // public verifyToken(token: string) {
  //   return this.jwtService.verify(token);
  // }

  private async verifyViaMeta(user: User, signature: string): Promise<boolean> {
    Logger.log(`AuthService.verifyViaMeta(${user}, ${signature})`);
    const msg = `Nonce: ${user.nonce}`;
    const msgHex = ethUtil.bufferToHex(Buffer.from(msg));
    // Check if signature is valid
    const msgBuffer = ethUtil.toBuffer(msgHex);

    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureParams = ethUtil.fromRpcSig(signature);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s,
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    return address.toLowerCase() === user.address.toLowerCase();
  }

  private async updateNonce(user: User): Promise<void> {
    user.nonce = this.passwordService.generateNonce();
    await user.save();
  }

  public async validateUser(address: string, signature: string) {
    try {
      const user = await User.findOne({
        where: { address: address, isDeleted: false, deletedAt: null },
      });

      const verified = await this.verifyViaMeta(user, signature);

      if (!verified) {
        throw new UnauthorizedException();
      }
      await this.updateNonce(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nonce, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
