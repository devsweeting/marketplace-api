import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isGETMethod } from 'modules/admin/admin.utils';
import { StorageService } from 'modules/storage/storage.service';
import { FileDownloadService } from 'modules/storage/file-download.service';
import { S3Provider } from 'modules/storage/providers/s3.provider';
import { ConfigService } from '@nestjs/config';
import { File } from 'modules/storage/entities/file.entity';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

export const getImage =
  (serviceAccessor: ServiceAccessor) =>
  async (response: RecordActionResponse, request: ActionRequest): Promise<RecordActionResponse> => {
    if (!isGETMethod(request)) {
      return response;
    }
    const configService = serviceAccessor.getService(ConfigService);
    const s3Provider = new S3Provider(configService);
    const fileDownloadService = new FileDownloadService();

    const storageService = new StorageService(s3Provider, fileDownloadService);

    if (response.records) {
      await Promise.all(
        response.records.map(async (record) => {
          const params = flat.unflatten(record.params);
          params.image = await File.findOne(params.imageId);
          if (params.image) {
            params.image.path = await storageService.getUrl(params.image);
          }

          record.params = flat.flatten(params);
          return record;
        }),
      );
    } else {
      const params = flat.unflatten(response.record.params);
      params.image = params.imageId ? await File.findOne(params.imageId) : null;

      if (params.image) {
        params.image.path = await storageService.getUrl(params.image);
      }
      response.record.params = flat.flatten(params);
    }

    return response;
  };
