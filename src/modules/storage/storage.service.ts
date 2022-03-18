import { Injectable } from '@nestjs/common';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { v4 } from 'uuid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { File } from 'modules/storage/file.entity';
import { UploadedFile } from 'adminjs';

@Injectable()
export class StorageService {
  public constructor(private readonly s3Provider: S3Provider) {}

  public async uploadAndSave(directory: string, rawFile: UploadedFile): Promise<File> {
    const object = await this.s3Provider.uploadFromAdmin(directory, rawFile);
    delete object.id;
    return new File(object).save();
  }

  public async uploadFromUrl(url: string, directory: string): Promise<File> {
    const path = await this.download(url);
    const object = await this.s3Provider.upload(path, directory);
    return new File(object).save();
  }

  private download(url: string): Promise<string> {
    const ext = path.extname(url);
    const dest = os.tmpdir() + '/' + v4() + ext;
    const file = fs.createWriteStream(dest);
    const downloader = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
      downloader.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(dest);
        });
      });
    });
  }
}
