import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';
import { FileTransformer } from './transformers/file.transformer';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [S3Provider, StorageService, FileTransformer],
  controllers: [],
  exports: [StorageService, FileTransformer],
})
export class StorageModule {}
