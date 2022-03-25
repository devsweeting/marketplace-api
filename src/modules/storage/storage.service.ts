import { Inject, Injectable } from '@nestjs/common';
import { File } from 'modules/storage/entities/file.entity';
import { ProviderInterface } from 'modules/storage/interfaces/provider.interface';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { FileDownloadService } from 'modules/storage/file-download.service';
import { UploadedFile } from 'adminjs';

@Injectable()
export class StorageService {
  public constructor(
    @Inject(S3Provider)
    private readonly provider: ProviderInterface,
    private readonly fileDownloadService: FileDownloadService,
  ) {}

  public async uploadFromUrl(url: string, directory: string): Promise<File> {
    const path = await this.fileDownloadService.download(url);
    const object = await this.provider.upload(path, directory);
    return new File(object).save();
  }

  public async uploadAndSave(directory: string, rawFile: UploadedFile): Promise<File> {
    const object = await this.provider.uploadFromAdmin(directory, rawFile);
    delete object.id;
    return new File(object).save();
  }

  public getUrl(file: File): string {
    return this.provider.getUrl(file);
  }
}
