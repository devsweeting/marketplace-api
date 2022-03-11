import { CreateResourceResult } from '../create-resource-result.type';
import { Asset } from '../../../../modules/partners/entities';

const createAssetResource = (): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'description', 'partner', 'updatedAt', 'createdAt'],
      // editProperties: ['name', 'refId', 'description', 'slug', 'image', 'attributes', 'partner'],
      // showProperties: ['id', 'name', 'refId', 'description', 'slug', 'image', 'updatedAt', 'createdAt'],
      // filterProperties: ['name', 'refId', 'description', 'updatedAt', 'createdAt'],
    }),
  ],
  options: {},
});

export default createAssetResource;