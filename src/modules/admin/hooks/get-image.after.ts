import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isGETMethod } from 'modules/admin/admin.utils';
import { StorageService } from 'modules/storage/storage.service';
import { File } from 'modules/storage/entities/file.entity';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

const getFile = async (serviceAccessor: ServiceAccessor, property: string, record) => {
  const storageService = serviceAccessor.getService(StorageService);
  const params = flat.unflatten(record.params);
  if (params[`${property}Id`]) {
    params[property] = await File.findOne(params[`${property}Id`]);

    if (params[property]) {
      params[property].path = storageService.getUrl(params[property]);
    }
  }
  record.params = flat.flatten(params);
  return record;
};

export const getImage =
  (serviceAccessor: ServiceAccessor, property: string) =>
  async (response: RecordActionResponse, request: ActionRequest): Promise<RecordActionResponse> => {
    if (!isGETMethod(request)) {
      return response;
    }

    if (response.records) {
      await Promise.all(
        response.records.map(async (record) => {
          return await getFile(serviceAccessor, property, record);
        }),
      );
    } else {
      await getFile(serviceAccessor, property, response.record);
    }

    return response;
  };
