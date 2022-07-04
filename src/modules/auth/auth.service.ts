import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Partner } from 'modules/partners/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/entities/user.entity';
import { PasswordService } from './password.service';
import { IsNull } from 'typeorm';
import * as ethUtil from 'ethereumjs-util';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  public validateApiKey(apiKey: string): Promise<Partner | null> {
    Logger.log(`AuthService.validateApiKey(${apiKey})`);
    return Partner.findOne({ where: { apiKey, isDeleted: false, deletedAt: IsNull() } });
  }

  public generateOtpToken(user: { id: string; email: string; role: RoleEnum }): string {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  public async generateToken(user: { id: string; address: string; role: RoleEnum }) {
    return this.jwtService.sign({
      id: user.id,
      address: user.address,
      role: user.role,
    });
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
