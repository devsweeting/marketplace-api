import { FileDownloadService } from 'modules/storage/file-download.service';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { ConfigService } from '@nestjs/config';
import { Collection } from 'modules/collections/entities';

const uploadFile =
  (uploadProperty, storagePath: string, serviceAccessor: ServiceAccessor) =>
  async (response, request, context) => {
    if (request.method !== 'post') return response;

    const { record } = context;
    const file = request.payload[uploadProperty];

    if (!record.isValid() || !file) {
      return response;
    }
    const configService = serviceAccessor.getService(ConfigService);
    const s3Provider = new S3Provider(configService);
    const fileDownloadService = new FileDownloadService();

    const storageService = new StorageService(s3Provider, fileDownloadService);

    const banner = await storageService.uploadAndSave(`${storagePath}/${record.id()}/`, file);

    const collection: Collection = await Collection.findOne(record.params.id);

    Object.assign(collection, { bannerId: banner.id });
    await collection.save();

    return response;
  };

export default uploadFile;
