import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [S3Provider, StorageService],
  controllers: [],
  exports: [StorageService],
})
export class StorageModule {}
