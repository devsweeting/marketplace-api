import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
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
    //expiration date doesn't expire on the user table
    // if (new Date() > new Date((await user).refreshtokenexpires)) {
    //   throw new UnauthorizedException();
    // }
    return { userId: payload.sub, username: payload.username };
  }
}
