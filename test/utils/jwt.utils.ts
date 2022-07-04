import { JwtService } from '@nestjs/jwt';
import { User } from 'modules/users/entities/user.entity';

const jwtService = new JwtService({
  privateKey: process.env.JWT_SECRET,
});

export const generateOtpToken = (user: User): string =>
  jwtService.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });

export const generateToken = (user: User): string =>
  jwtService.sign({
    id: user.id,
    address: user.address,
    role: user.role,
  });

export const generateNonce = (): string => String(Math.floor(Math.random() * 1000000));
