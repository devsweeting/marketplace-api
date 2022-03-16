import { Attribute } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';

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
  ],
  options: {},
});

export default createAttributeResource;
