import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenPayload } from '../auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField(),
      ignoreExpiration: false,
      // secretOrKey: process.env.JWT_REFRESH_SECRET,
      secretOrKey: 'im_a_duck',
      passReqToCallback: true, //passes request body to validate function
    });
  }

  async validate(req, payload: RefreshTokenPayload) {
    console.log('req in refresh strategy', req, payload);
    const user = await this.userService.findOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException('NO USER FOUND');
    }
    if (req.body.refreshToken != (await user).refreshtoken) {
      throw new UnauthorizedException('NO REFRESH TOKEN FOUND');
    }
    return payload;
  }
}
