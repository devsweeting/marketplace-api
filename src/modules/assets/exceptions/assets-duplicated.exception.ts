import { BadRequestException } from '@nestjs/common';

export class AssetsDuplicatedException extends BadRequestException {
  private readonly duplicatedRefIds: string[];

  public constructor(refIds: string[]) {
    super();
    this.duplicatedRefIds = refIds;
  }

  public getResponse(): string | object {
    return Object.assign(super.getResponse(), {
      message: 'Duplicated assets',
      refIds: this.duplicatedRefIds,
    });
  }
}
