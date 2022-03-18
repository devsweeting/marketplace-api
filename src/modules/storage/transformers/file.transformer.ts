import { Injectable } from '@nestjs/common';
import { File } from '../file.entity';
import { FileResponse } from '../dto/file.response';

@Injectable()
export class FileTransformer {
  public transform(file: File): FileResponse {
    return {
      name: file.name,
      url: file.url,
      mimeType: file.mimeType,
    };
  }
}
