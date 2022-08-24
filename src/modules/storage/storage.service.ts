import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { File } from 'modules/storage/entities/file.entity';
import { ProviderInterface } from 'modules/storage/interfaces/provider.interface';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { FileDownloadService } from 'modules/storage/file-download.service';
import { UploadedFile } from 'adminjs';
import { v4 } from 'uuid';
import fs from 'fs';

@Injectable()
export class StorageService {
  public constructor(
    @Inject(S3Provider)
    private readonly provider: ProviderInterface,
    private readonly fileDownloadService: FileDownloadService,
  ) {}

  public onModuleInit() {
    if (
      process.env.NODE_ENV.toUpperCase() === 'DEVELOP' ||
      process.env.NODE_ENV.toUpperCase() === 'TEST'
    ) {
      this.provider.ensureBucket();
    }
  }

  public async uploadFromUrls(
    records: { source_url: string }[],
    directory: string,
  ): Promise<File[]> {
    try {
      const pathList: any = await this.fileDownloadService.downloadAll(records);
      const files = pathList.map(async (el) => {
        const object = await this.provider.upload(el, directory);
        fs.unlink(el, (err) => {
          if (err) new Error(`Failed to remove file ${el}: ${err}`);
        });
        return new File({ ...object, id: v4() }).save();
      });
      return Promise.all(files);
    } catch (error) {
      throw new HttpException(`Error: ${error}`, HttpStatus.BAD_REQUEST);
    }
  }

  public async uploadAndSave(directory: string, rawFile: UploadedFile): Promise<File> {
    const object = await this.provider.uploadFromAdmin(directory, rawFile);
    return new File({ ...object, id: v4() }).save();
  }

  public getUrl(file: File): string {
    return this.provider.getUrl(file);
  }
}
