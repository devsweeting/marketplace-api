import { StorageService } from 'modules/storage/storage.service';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
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

    const storageService = serviceAccessor.getService(StorageService);

    const banner = await storageService.uploadAndSave(`${storagePath}/${record.id()}/`, file);

    const collection: Collection = await Collection.findOne(record.params.id);

    Object.assign(collection, { bannerId: banner.id });
    await collection.save();

    return response;
  };

export default uploadFile;
