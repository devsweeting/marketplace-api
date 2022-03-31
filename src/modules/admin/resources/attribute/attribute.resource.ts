import { Attribute } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import loggerFeature from '@adminjs/logger';
import loggerConfig from '@/src/config/logger.config';

const createAttributeResource = (): CreateResourceResult<typeof Attribute> => ({
  resource: Attribute,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['trait', 'value', 'updatedAt', 'createdAt'],
      // editProperties: ['trait', 'value', 'asset'],
      // showProperties: ['id', 'trait', 'value', 'assetId', 'updatedAt', 'createdAt'],
      // filterProperties: ['trait', 'value', 'updatedAt', 'createdAt'],
    }),
    loggerFeature(loggerConfig),
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

export default createAttributeResource;
