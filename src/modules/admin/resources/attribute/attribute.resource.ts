import { CreateResourceResult } from '../create-resource-result.type';
import { Attribute } from '../../../partners/entities';

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
