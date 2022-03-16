import { BadRequestException } from '@nestjs/common';

import { ErrorEnum } from './error.enum';

type PasswordValidationProperty = 'password';

type PasswordValidationType = 'minLength';

interface PasswordValidationField {
  property: PasswordValidationProperty;
  type: PasswordValidationType;
  value: number | string;
}

export class PasswordValidationException extends BadRequestException {
  protected errors: PasswordValidationField[];

  constructor(errors: PasswordValidationField[]) {
    super(ErrorEnum.InvalidPassword);
    this.errors = errors;
  }

  public getResponse(): object {
    return Object.assign(super.getResponse(), {
      message: this.errors,
    });
  }
}
