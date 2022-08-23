import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import os from 'os';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { ConfigService } from '@nestjs/config';
import { Promise } from 'bluebird';

const ACCEPTED_IMAGE_CONTENT_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

@Injectable()
export class FileDownloadService {
  public constructor(private readonly configService: ConfigService) {}

  private getImage = (image) => {
    const options: any = new URL(image);
    options.timeout = 5000;
    options.agent = new https.Agent({ keepAlive: true });

    const ext = path.extname(image);
    const dest = os.tmpdir() + '/' + v4() + ext;
    const downloader = image.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
      downloader.get(options, (response) => {
        if (response.statusCode !== 200) {
          reject(`Error: ${response.statusCode}`);
        }

        const imageContentType = response.headers['content-type'];
        if (imageContentType && !ACCEPTED_IMAGE_CONTENT_TYPES.includes(imageContentType)) {
          reject(
            `Content-type ${imageContentType} for ${image} is not allowed. Use .png, .jpg, or .webp instead`,
          );
        }

        const ws = fs.createWriteStream(dest, { encoding: 'binary', flags: 'a+' });
        response
          .on('end', () => {
            ws.close();
            resolve(dest);
          })
          .on('error', reject)
          .pipe(ws);
      });
    });
  };

  public async downloadAll(data: { url: string }[]) {
    const urls = data.map((el) => el.url);
    const r = await Promise.map(urls, this.getImage, {
      concurrency: 100,
    })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new HttpException(`Error: ${error}`, HttpStatus.BAD_REQUEST);
      });
    return r;
  }
}
