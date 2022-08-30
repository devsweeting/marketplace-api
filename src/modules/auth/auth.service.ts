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

// NOTE - naming it RefreshTokenPayload with two properties: jti and sub which are the proper versions of the full claim that we passed into signAsync earlier, jwtid and subject respectively. These two properties will return the exact same values that were embedded when the token was signed.
export interface RefreshTokenPayload {
  // jti: number;
  // sub: number;
  email: string;
  userId: string;
  role: RoleEnum;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private userRepository: UsersService,
  ) {}

  public validateApiKey(apiKey: string): Promise<Partner | null> {
    return Partner.findOne({ where: { apiKey, isDeleted: false, deletedAt: IsNull() } });
  }

  public generateOtpToken(user: { id: string; email: string; role: RoleEnum }): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  public async generateAccessToken(user: { id: string; email: string; role: RoleEnum }) {
    const accessToken = this.jwtService.sign({
      id: user.id,
      address: user.email, //this was address before
      role: user.role,
    });
    console.log('generateAccessToken', accessToken);
    return accessToken;
  }

  //should the above also look like this
  async getRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    console.log('refreshToken', refreshToken);
    return refreshToken;
  }

  async updateRefreshTokenInUser(refreshToken: string, email: string) {
    if (refreshToken) {
      refreshToken = await bcrypt.hash(refreshToken, 10);
    }
    const user = await User.findOne({
      where: { email, isDeleted: false, deletedAt: null },
    });
    user.refreshToken = refreshToken;
    await user.save();
  }

  async getNewAccessAndRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const refreshToken = await this.getRefreshToken(payload);
    await this.updateRefreshTokenInUser(refreshToken, payload.email);

    return {
      accessToken: await this.generateAccessToken(payload), //should be address
      refreshToken: refreshToken,
    };
  }

  public async createAccessTokenFromRefreshToken(
    refresh_token: string,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.resolveRefreshToken(refresh_token);

    const accessToken = await this.generateAccessToken(user);

    return { user, accessToken };
  }

  public async resolveRefreshToken(refresh_token: string): Promise<User> {
    const payload = await this.decodeRefreshToken(refresh_token);
    const userId = payload.userId.toString();

    if (!userId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    const user = await this.userRepository.findOne(userId);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user;
  }

  private async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  public verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

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
