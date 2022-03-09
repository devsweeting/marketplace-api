import { BadRequestException } from '@nestjs/common';

export class AssetsDuplicatedException extends BadRequestException {
  private readonly duplicatedNames: string[];

  public constructor(names: string[]) {
    super();
    this.duplicatedNames = names;
  }

  public getResponse(): string | object {
    return Object.assign(super.getResponse(), {
      message: 'Duplicated assets',
      names: this.duplicatedNames,
    });
  }
}
