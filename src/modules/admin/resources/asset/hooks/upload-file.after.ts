import { FileDownloadService } from 'modules/storage/file-download.service';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { ConfigService } from '@nestjs/config';
import { Asset } from 'modules/assets/entities';

const uploadFile =
  (uploadProperty, storagePath: string, serviceAccessor: ServiceAccessor) =>
  async (response, request, context) => {
    if (request.method !== 'post') return response;

    const { record } = context;
    const file = request.payload[uploadProperty];

    if (!record.isValid()) {
      return response;
    }

    if (!file) {
      const asset: Asset = await Asset.findOne(record.params.id);
      Object.assign(asset, { imageId: null });
      await asset.save();
      return response;
    }
    const configService = serviceAccessor.getService(ConfigService);
    const s3Provider = new S3Provider(configService);
    const fileDownloadService = new FileDownloadService();

    const storageService = new StorageService(s3Provider, fileDownloadService);

    const image = await storageService.uploadAndSave(`${storagePath}/${record.id()}/`, file);

    const asset: Asset = await Asset.findOne(record.params.id);
    Object.assign(asset, { imageId: image.id });
    await asset.save();

    return response;
  };

export default uploadFile;
