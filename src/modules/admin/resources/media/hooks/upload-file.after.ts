import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';

import { Media } from 'modules/assets/entities';

const uploadFile =
  (uploadProperty, storagePath: string, serviceAccessor: ServiceAccessor) =>
  async (response, request, context) => {
    if (request.method !== 'post') return response;

    const { record } = context;
    const file = request.payload[uploadProperty];

    if (!record.isValid() || !file || file.id) {
      return response;
    }

    const storageService = serviceAccessor.getService(StorageService);

    const image = await storageService.uploadAndSave(`${storagePath}/${record.id()}/`, file);
    const media: Media = await Media.findOne(record.params.id);

    const data = {};
    data[`${uploadProperty}Id`] = image.id;
    Object.assign(media, data);
    await media.save();

    return response;
  };

export default uploadFile;
