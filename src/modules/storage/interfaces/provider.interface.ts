import { UploadResponseDto } from 'modules/storage/dto/upload-response.dto';
import { File } from 'modules/storage/entities/file.entity';

export interface ProviderInterface {
  upload(filePath: string, directory: string): Promise<UploadResponseDto>;
  getUrl(file: File): string;
  // checkBucketExists(): void;

  ensureBucket(): void;
}
