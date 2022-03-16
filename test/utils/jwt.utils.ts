import { JwtService } from '@nestjs/jwt';
import { User } from 'modules/users/user.entity';

const jwtService = new JwtService({
  privateKey: process.env.JWT_SECRET,
});

export const generateToken = (user: User): string =>
  jwtService.sign({
    subId: user.id,
    email: user.email,
    role: user.role,
  });
