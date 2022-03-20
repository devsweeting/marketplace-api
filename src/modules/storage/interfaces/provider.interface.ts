import { UploadedFile } from 'adminjs';
import { UploadResponseDto } from 'modules/storage/dto/upload-response.dto';
import { File } from 'modules/storage/file.entity';

export interface ProviderInterface {
  upload(filePath: string, directory: string): Promise<UploadResponseDto>;
  uploadFromAdmin(path: string, file: UploadedFile): Promise<UploadResponseDto>;
  getUrl(file: File): string;
}
