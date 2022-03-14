import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { LABELS_COMPONENT } from 'modules/admin/components.bundler';
import { saveLabels } from 'modules/admin/resources/asset/hooks/save-labels.hook';
import { getLabels } from './hooks/get-labels.hook';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';

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
  options: {
    actions: {
      show: {
        after: [getLabels],
      },
      new: {
        after: [saveLabels],
        isAccessible: forAdminGroup,
      },
      edit: {
        after: [getLabels, saveLabels],
        isAccessible: forAdminGroup,
      },
      delete: {
        isAccessible: forAdminGroup,
      },
    },
    properties: {
      partnerId: {
        position: 1,
      },
      name: {
        position: 2,
      },
      refId: {
        position: 3,
      },
      slug: {
        position: 4,
      },
      description: {
        position: 5,
      },
      externalUrl: {
        position: 6,
      },
      marketplace: {
        position: 7,
      },
      auctionType: {
        position: 8,
      },
      image: {
        position: 9,
      },
      labels: {
        position: 10,
        components: {
          edit: LABELS_COMPONENT,
          show: LABELS_COMPONENT,
        },
      },
      deletedAt: {
        position: 11,
        components: {
          show: SHOW_DELETED_AT,
        },
      },
    },
  },
});

export default createAssetResource;
