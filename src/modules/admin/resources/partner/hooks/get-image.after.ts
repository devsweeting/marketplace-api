import { ActionRequest, flat, RecordActionResponse } from 'adminjs';
import { isGETMethod } from 'modules/admin/admin.utils';
import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { Partner } from 'modules/partners/entities';

const getPartnerImages = async (serviceAccessor, record) => {
  const storageService = serviceAccessor.getService(StorageService);
  const params = flat.unflatten(record.params);
  const partner: Partner = await Partner.findOne({
    where: { id: params.id },
    relations: ['avatar', 'logo', 'banner'],
  });
  params.avatar = partner.avatar;
  params.logo = partner.logo;
  params.banner = partner.banner;
  if (params.avatar) {
    params.avatar.path = await storageService.getUrl(params.avatar);
  }
  if (params.logo) {
    params.logo.path = await storageService.getUrl(params.logo);
  }
  if (params.banner) {
    params.banner.path = await storageService.getUrl(params.banner);
  }
  record.params = flat.flatten(params);
  return record;
};

export const getImage =
  (serviceAccessor: ServiceAccessor) =>
  async (response: RecordActionResponse, request: ActionRequest): Promise<RecordActionResponse> => {
    if (!isGETMethod(request)) {
      return response;
    }
    if (response.records) {
      await Promise.all(
        response.records.map(async (record) => {
          return await getPartnerImages(serviceAccessor, record);
        }),
      );
    } else {
      await getPartnerImages(serviceAccessor, response.record);
    }

    return response;
  };
