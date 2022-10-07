import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { UploadResponseDto } from 'modules/storage/dto/upload-response.dto';
import { IAwsUploadResponse } from 'modules/storage/interfaces/aws-upload-response.interface';
import { File } from 'modules/storage/entities/file.entity';
import { IAwsProvider } from 'modules/storage/interfaces/provider.interface';

@Injectable()
export class S3Provider implements IAwsProvider {
  public constructor(private readonly configService: ConfigService) {}

  public async upload(filePath: string, directory: string): Promise<UploadResponseDto> {
    const stats = fs.statSync(filePath);

    const key = [...directory.split('/').filter((l) => !!l), path.basename(filePath)].join('/');

    const response = await this.s3Upload(filePath, key);

    return {
      id: JSON.parse(response.ETag),
      name: path.basename(filePath),
      path: response.key,
      mimeType: mime.lookup(filePath),
      storage: StorageEnum.S3,
      size: stats.size,
      absoluteUrl: response.Location,
    };
  }

  public async uploadFromAdmin(path: string, file: any): Promise<UploadResponseDto> {
    const fileName = [...path.split('/').filter((l) => !!l), file.name].join('/');
    const response = await this.s3Upload(file.path, fileName);
    return {
      id: JSON.parse(response.ETag),
      name: file.name,
      path: response.key,
      mimeType: file.type,
      storage: StorageEnum.S3,
      size: file.size,
      absoluteUrl: response.Location,
    };
  }

  public getUrl(file: File): string {
    return `${this.configService.get('aws.default.cloudFrontDomain')}/${file.path}`;
  }

  public async ensureBucket() {
    const s3 = await this.getS3();
    const bucket: string = this.configService.get('aws.default.s3Bucket');
    const foo = await s3.listBuckets().promise();
    if (!foo.Buckets.map((b) => b.Name).includes(bucket)) {
      const params = {
        Bucket: bucket,
      };
      await s3.createBucket(params).promise();
    }
  }

  private async s3Upload(filePath: string, key: string): Promise<IAwsUploadResponse> {
    const bucket: string = this.configService.get('aws.default.s3Bucket');
    const s3 = await this.getS3();
    const tmpFile = await fs.createReadStream(filePath);

    return (await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: tmpFile,
        ACL: 'public-read',
      })
      .promise()) as IAwsUploadResponse;
  }

  private getS3(): S3 {
    const options = {
      region: this.configService.get('aws.default.region'),
      accessKeyId: this.configService.get('aws.default.accessKey'),
      secretAccessKey: this.configService.get('aws.default.secretKey'),
      s3ForcePathStyle: this.configService.get('aws.default.s3ForcePathStyle'),
    };
    const endpoint = this.configService.get('aws.default.endpoint');
    if (endpoint) {
      options['endpoint'] = endpoint;
    }
    return new S3(options);
  }
}
