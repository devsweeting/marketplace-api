import { Module } from '@nestjs/common';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';
import { FileDownloadService } from 'modules/storage/file-download.service';

@Module({
  providers: [S3Provider, StorageService, FileDownloadService],
  controllers: [],
  exports: [StorageService],
})
export class StorageModule {}
