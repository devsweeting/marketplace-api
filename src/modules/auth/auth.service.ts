import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Partner } from 'modules/partners/entities';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/user.entity';
import { PasswordService } from './password.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  public validateApiKey(apiKey: string): Promise<Partner | null> {
    Logger.log(`AuthService.validateApiKey(${apiKey})`);
    return Partner.findOne({ where: { apiKey } });
  }

  public generateToken(user: { id: string; email: string; role: RoleEnum }): string {
    const payload = { subId: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }

  public verifyToken(token: string) {
    return this.jwtService.verify(token);
  }

  public async validateUser(email: string, newPassword: string) {
    try {
      const user = await User.findOne({ where: { email } });
      await this.passwordService.verify(user.password, newPassword);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
