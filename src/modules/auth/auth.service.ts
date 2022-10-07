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
import { UserRefresh } from 'modules/users/entities/user-refresh.entity';

export interface IRefreshTokenPayload {
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

  async updateRefreshTokenForUser(
    userId: string,
    newRefreshToken: string,
    oldRefreshToken?: string,
  ) {
    //invalidate the succesfully used token
    if (oldRefreshToken) {
      await UserRefresh.markTokenExpired(oldRefreshToken);
    }
    // create new refresh token entry
    const userRefresh = await UserRefresh.create({
      userId,
      refreshToken: newRefreshToken,
    }).save();
    return userRefresh;
  }

  async createLoginTokens(user: { id: string; email: string; role: RoleEnum }) {
    const payload = { id: user.id, email: user.email, role: user.role, assignedAt: Date.now() };
    const refreshToken = await this.generateRefreshToken(payload);
    const updatedUser = await this.updateRefreshTokenForUser(payload.id, refreshToken);

    return {
      user: updatedUser,
      accessToken: await this.generateAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  public async createNewAccessTokensFromRefreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // validate refresh token.
    const { user, usedRefreshToken } = await this.resolveRefreshToken(refreshToken);
    const accessToken = await this.generateAccessToken(user);

    const newRefreshToken = await this.generateRefreshToken(user);
    await this.updateRefreshTokenForUser(user.id, newRefreshToken, usedRefreshToken);
    return { accessToken, refreshToken: newRefreshToken };
  }

  private async resolveRefreshToken(
    reqRefreshToken: string,
  ): Promise<{ usedRefreshToken: string; user: User }> {
    try {
      //Check if the token is expired
      const decodedToken: IRefreshTokenPayload = this.jwtService.verify(reqRefreshToken, {
        secret: this.configService.get('jwt.default.jwtRefreshSecret'),
      });

      const userId = decodedToken.userId;
      if (!userId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
      }

      //check if the token in the request matches tokens in the database
      const userToken = await UserRefresh.findToken(reqRefreshToken);
      if (reqRefreshToken !== userToken.refreshToken) {
        throw new UnauthorizedException('Invalid token');
      }

      return { user, usedRefreshToken: reqRefreshToken };
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
