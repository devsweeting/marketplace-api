import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

import { Asset } from 'modules/assets/entities';

const uploadFile =
  (uploadProperty, storagePath: string, serviceAccessor: ServiceAccessor) =>
  async (response, request, context) => {
    if (request.method !== 'post') return response;

    const { record } = context;
    const file = request.payload[uploadProperty];

    if (!record.isValid() || !file) {
      return response;
    }
    const storageService = serviceAccessor.getService(StorageService);

    const image = await storageService.uploadAndSave(`${storagePath}/${record.id()}/`, file);

    const asset: Asset = await Asset.findOne(record.params.id);
    Object.assign(asset, { imageId: image.id });
    await asset.save();

    return response;
  };

export default uploadFile;
