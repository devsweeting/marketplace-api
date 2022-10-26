import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtOtpStrategy extends PassportStrategy(Strategy, 'jwt-otp') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public validate(payload: { id: string; email: string; role: string }): Record<string, string> {
    return Object.assign(
      payload.id && payload.email
        ? { id: payload.id, email: payload.email, role: payload.role }
        : {},
    );
  }
}
