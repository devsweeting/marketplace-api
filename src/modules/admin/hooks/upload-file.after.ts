import { S3Provider } from 'modules/storage/providers/s3.provider';
import { StorageService } from 'modules/storage/storage.service';

const uploadFile = (uploadProperty, configService) => async (response, request, context) => {
  if (request.method !== 'post') return response;

  const { record } = context;
  const file = request.payload[uploadProperty];

  if (!record.isValid() || !file) {
    return response;
  }
  const s3Provider = new S3Provider(configService);
  const storageService = new StorageService(s3Provider);

  await storageService.uploadAndSave(`images/assets/${record.id()}/`, file);

  return response;
};

export default uploadFile;
