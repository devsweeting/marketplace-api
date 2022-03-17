import { Injectable } from '@nestjs/common';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { v4 } from 'uuid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';

@Injectable()
export class StorageService {
  public constructor(private readonly s3Provider: S3Provider) {}

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
