import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  public validate(payload: any) {
    console.log('jwtstrategy:', payload);
    return Object.assign(
      payload.id && payload.address
        ? { id: payload.id, address: payload.address, role: payload.role }
        : {},
    );
  }
}
