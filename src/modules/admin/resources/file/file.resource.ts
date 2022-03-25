import { CreateResourceResult } from '../create-resource-result.type';
import { File } from 'modules/storage/entities/file.entity';

const createFileResource = (): CreateResourceResult<typeof File> => ({
  resource: File,
  features: [
    (options): object => ({
      ...options,
      showProperties: [],
      filterProperties: [],
      listProperties: [],
      editProperties: [],
    }),
  ],
  options: {
    actions: {
      list: {
        isAccessible: false,
      },
      show: {
        isAccessible: false,
      },
      edit: {
        isAccessible: false,
      },
      new: {
        isAccessible: false,
      },
      delete: {
        isAccessible: false,
      },
      bulkDelete: {
        isAccessible: false,
      },
    },
  },
});

export default createFileResource;
