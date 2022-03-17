import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { UploadResponseDto } from 'modules/storage/dto/upload-response.dto';
import { AwsUploadResponseInterface } from 'modules/storage/interfaces/aws-upload-response.interface';
import { File } from 'modules/storage/file.entity';
import { ProviderInterface } from 'modules/storage/interfaces/provider.interface';

@Injectable()
export class S3Provider implements ProviderInterface {
  public constructor(private readonly configService: ConfigService) {}

  public async upload(filePath: string, directory: string): Promise<UploadResponseDto> {
    const bucket: string = this.configService.get('aws.default.s3Bucket');
    const s3 = await this.getS3();
    const stats = fs.statSync(filePath);
    const key =
      directory
        .split('/')
        .filter((d) => !!d)
        .join('/') + path.basename(filePath);
    const tmpFile = fs.createReadStream(filePath);

    const response = (await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: tmpFile,
      })
      .promise()) as AwsUploadResponseInterface;

    return {
      id: JSON.parse(response.ETag),
      name: path.basename(filePath),
      path: response.key,
      mimeType: mime.lookup(filePath),
      storage: StorageEnum.S3,
      size: stats.size,
    };
  }

  public getUrl(file: File): string {
    return this.getS3().getSignedUrl('getObject', {
      Key: file.path,
      Bucket: this.configService.get('aws.default.s3Bucket'),
      Expires: 30,
    });
  }

  private getS3(): S3 {
    return new S3({
      region: this.configService.get('aws.default.region'),
      accessKeyId: this.configService.get('aws.default.accessKey'),
      secretAccessKey: this.configService.get('aws.default.secretKey'),
    });
  }
}
