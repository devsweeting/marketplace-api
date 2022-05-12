import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { Media } from 'modules/assets/entities';
import { isGETMethod } from 'modules/admin/admin.utils';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { StorageService } from 'modules/storage/storage.service';

const getMedia = async (serviceAccessor: ServiceAccessor, record) => {
  const storageService = serviceAccessor.getService(StorageService);
  const params = flat.unflatten(record.params);
  params.assetMedia = await Media.find({
    where: { assetId: params.id, isDeleted: false, deletedAt: null },
    relations: ['file'],
  });
  params.assetMedia.map((el) => {
    if (el.file) {
      el.file.path = storageService.getUrl(el.file);
    }
    return el;
  });
  record.params = flat.flatten(params);
  return record;
};

export const loadMedia =
  (serviceAccessor: ServiceAccessor) =>
  async (response: RecordActionResponse, request: ActionRequest): Promise<RecordActionResponse> => {
    if (!isGETMethod(request)) {
      return response;
    }
    if (response.records) {
      await Promise.all(
        response.records.map(async (record) => {
          return await getMedia(serviceAccessor, record);
        }),
      );
    } else {
      await getMedia(serviceAccessor, response.record);
    }

    return response;
  };
