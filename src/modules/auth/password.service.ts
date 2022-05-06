import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

import { PasswordValidationException } from '../common/exceptions/password-validation.exception';

export const MIN_PASSWORD_LENGTH = 8;
export const saltRounds = 10;

@Injectable()
export class PasswordService {
  public generateNonce(): string {
    return String(Math.floor(Math.random() * 1000000));
  }

  public encode(password: string): Promise<string> {
    return bcrypt.hash(password, saltRounds) as Promise<string>;
  }

  public verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword) as Promise<boolean>;
  }

  public validate(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new PasswordValidationException([
        {
          property: 'password',
          type: 'minLength',
          value: MIN_PASSWORD_LENGTH,
        },
      ]);
    }
  }
}
