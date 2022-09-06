import {
  HttpException,
  HttpStatus,
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
import { TokenExpiredError } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as ethUtil from 'ethereumjs-util';

export interface RefreshTokenPayload {
  email: string;
  userId: string;
  role: RoleEnum;
  assignedAt: Date;
  iat: string; //Issued At Claim.
  exp: number; //Expiry Claim.
}

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

  public async generateRefreshToken(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { userId: user.id, email: user.email, role: user.role, assignedAt: Date.now() };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.default.jwtRefreshSecret'),
      expiresIn: this.configService.get('jwt.default.jwtRefreshExpiresIn'),
    });
    return refreshToken;
  }

  async updateRefreshTokenInUser(email: string, refreshToken?: string) {
    const user = await User.findOne({
      where: { email, isDeleted: false, deletedAt: null },
    });
    // Remove refreshToken if null
    user.refreshToken = !!refreshToken ? refreshToken : null;
    await user.save();
  }

  async createLoginTokens(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role, assignedAt: Date.now() };
    const refreshToken = await this.generateRefreshToken(payload);
    await this.updateRefreshTokenInUser(payload.email, refreshToken);

    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  public async createNewAccessTokensFromRefreshToken(
    refreshToken: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // validate refresh token.
    const { user } = await this.resolveRefreshToken(refreshToken);

    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);
    await this.updateRefreshTokenInUser(user.email, newRefreshToken);
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  private async resolveRefreshToken(
    encodedRefreshToken: string,
  ): Promise<{ refreshToken: RefreshTokenPayload; user: User }> {
    try {
      //Check if a token is expired
      const refreshToken = this.jwtService.verify(encodedRefreshToken, {
        secret: this.configService.get('jwt.default.jwtRefreshSecret'),
      });

      const userId = refreshToken.userId;
      if (!userId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      const user = await this.userRepository.findOne(userId);

      if (!user) {
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
      }

      return { user, refreshToken };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnauthorizedException('Invalid token');
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
