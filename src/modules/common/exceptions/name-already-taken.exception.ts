import { ConflictException } from '@nestjs/common';
import { ErrorEnum } from 'modules/common/exceptions/error.enum';

export class NameAlreadyTakenException extends ConflictException {
  public constructor() {
    super(ErrorEnum.NameAlreadyTaken);
  }
}
