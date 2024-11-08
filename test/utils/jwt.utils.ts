import { JwtService } from '@nestjs/jwt';
import { User } from 'modules/users/entities/user.entity';

const jwtService = new JwtService({
  privateKey: process.env.JWT_SECRET,
});

export const generateToken = (user: User): string =>
  jwtService.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });

// eslint-disable-next-line no-magic-numbers
export const generateNonce = (): string => String(Math.floor(Math.random() * 1000000));
