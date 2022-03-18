import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { UploadResponseDto } from 'modules/storage/dto/upload-response.dto';
import { AwsUploadResponseInterface } from 'modules/storage/interfaces/aws-upload-response.interface';

@Injectable()
export class S3Provider {
  public constructor(private readonly configService: ConfigService) {}

  public async upload(filePath: string, directory: string): Promise<UploadResponseDto> {
    const stats = fs.statSync(filePath);
    const key =
      directory
        .split('/')
        .filter((d) => !!d)
        .join('/') + path.basename(filePath);

    const response = await this.s3Upload(filePath, key);

    return {
      id: JSON.parse(response.ETag),
      name: path.basename(filePath),
      url: response.Location || null,
      path: response.key,
      mimeType: mime.lookup(filePath),
      storage: StorageEnum.S3,
      size: stats.size,
    };
  }
  public async uploadFromAdmin(path: string, file: any): Promise<UploadResponseDto> {
    const fileName = [...path.split('/').filter((l) => !!l), file.name].join('/');
    const response = await this.s3Upload(file.path, fileName);
    return {
      id: JSON.parse(response.ETag),
      name: file.name,
      url: response.Location || null,
      path: response.key,
      mimeType: file.type,
      storage: StorageEnum.S3,
      size: file.size,
    };
  }

  private async s3Upload(filePath: string, key: string): Promise<AwsUploadResponseInterface> {
    const bucket: string = this.configService.get('aws.default.s3Bucket');
    const s3 = await this.getS3();
    const tmpFile = await fs.createReadStream(filePath);

    return (await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: tmpFile,
      })
      .promise()) as AwsUploadResponseInterface;
  }

  private async getS3(): Promise<S3> {
    return new S3({
      region: this.configService.get('aws.default.region'),
      accessKeyId: this.configService.get('aws.default.accessKey'),
      secretAccessKey: this.configService.get('aws.default.secretKey'),
    });
  }
}
