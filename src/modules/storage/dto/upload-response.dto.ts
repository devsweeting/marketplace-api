import { StorageEnum } from 'modules/storage/enums/storage.enum';

export class UploadResponseDto {
  public id: string;
  public name: string;
  public path: string;
  public mimeType: string;
  public storage: StorageEnum;
  public size: number;
}
