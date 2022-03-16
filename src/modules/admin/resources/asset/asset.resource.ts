import { ATTRIBUTE_PROPERTY } from 'modules/admin/components.bundler';
import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { forAdminGroup } from '../user/user-permissions';
import { loadAttributes } from './hooks/load-attributes.hook';
import { saveAttributes } from './hooks/save-attributes.hook';

const baseProperties = ['name', 'refId', 'description', 'slug', 'image'];

const createAssetResource = (): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'description', 'partnerId', 'updatedAt', 'createdAt'],
      editProperties: [...baseProperties, 'partnerId', 'assetAttributes'],
      showProperties: [
        'id',
        ...baseProperties,
        'partnerId',
        'assetAttributes',
        'updatedAt',
        'createdAt',
      ],
      filterProperties: [],
    }),
  ],
  options: {
    actions: {
      new: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [saveAttributes],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [loadAttributes, saveAttributes],
      },
      show: {
        after: [loadAttributes],
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      delete: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      bulkDelete: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
    },
    properties: {
      assetAttributes: {
        components: {
          edit: ATTRIBUTE_PROPERTY,
          show: ATTRIBUTE_PROPERTY,
        },
      },
      deletedAt: {
        components: {
          show: SHOW_DELETED_AT,
        },
      },
    },
  },
});

export default createAssetResource;
