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
import { IsNull } from 'typeorm';
import { UsersService } from 'modules/users/users.service';
import bcrypt from 'bcryptjs';
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

export interface RefreshTokenPayload {
  email: string;
  userId: string;
  role: RoleEnum;
  iat: string; //iat — Issued At Claim. Time at which the token was issued by the issuer for use.
  exp: number; //exp — Expiry Claim. how long until it will not be considered valid.
}
import * as ethUtil from 'ethereumjs-util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private userRepository: UsersService,
    private configService: ConfigService,
  ) {}
  public validateApiKey(apiKey: string): Promise<Partner | null> {
    return Partner.findOne({ where: { apiKey, isDeleted: false, deletedAt: IsNull() } });
  }

  public async generateAccessToken(user: { id: string; email: string; role: RoleEnum }) {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  //should the above also look like this
  public async generateRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { userId: user.id, email: user.email, role: user.role };

    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.default.jwtRefreshSecret'), // ERROR ENV variables not importing with configService, this is undefined but still passing verficication
      expiresIn: '7d', //TEMP
      //   expiresIn: `${this.configService.get('jwt.default.jwtRefreshExpiresIn')}s`, //ERROR --> "expiresIn" should be a number of seconds or string representing a timespan
    });
    // console.log('JWT_REFRESH_SECRET', this.configService.get('jwt.default.jwtRefreshSecret'));
    // console.log('refreshToken', refreshToken);
    return refreshToken;
  }

  async updateRefreshTokenInUser(email: string, refreshToken?: string) {
    const user = await User.findOne({
      where: { email, isDeleted: false, deletedAt: null },
    });
    // if no refreshToken is passed it will remove the current refresh token.
    user.refreshToken = !!refreshToken ? refreshToken : null;
    await user.save();
  }

  async createLoginTokens(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const refreshToken = await this.generateRefreshToken(payload);
    //should this be hashedAndChecked
    // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.updateRefreshTokenInUser(payload.email, refreshToken);

    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  public async createNewAccessTokensFromRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: User }> {
    // validate our refresh token.
    const { user } = await this.resolveRefreshToken(refreshToken);

    //Once we use the refresh token, expire it until the user signs in again
    await this.updateRefreshTokenInUser(user.email, null);
    const accessToken = await this.generateAccessToken(user);
    return { user, accessToken };
  }

  private async resolveRefreshToken(
    encodedRefreshToken: string,
  ): Promise<{ refreshToken: RefreshTokenPayload; user: User }> {
    try {
      //Checks if a token is expired
      const refreshToken = this.jwtService.verify(encodedRefreshToken);
      console.log('refreshToken', refreshToken);

      const userId = refreshToken.userId;
      if (!userId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      return { user, refreshToken };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
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
    user.nonce = this.userService.generateNonce();
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
