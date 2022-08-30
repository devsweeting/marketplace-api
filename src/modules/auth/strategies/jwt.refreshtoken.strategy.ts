import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Read up on this line
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET, //what is this line
      passReqToCallback: true, //passes request body to validate function
    });
  }

  async validate(req, payload: any) {
    console.log('req in refresh strategy', req);
    const user = await this.userService.findOne(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (req.body.refreshToken != (await user).refreshtoken) {
      throw new UnauthorizedException();
    }
    if (new Date() > new Date((await user).refreshtokenexpires)) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, username: payload.username };
  }
}
