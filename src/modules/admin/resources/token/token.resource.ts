import { marketNavigation } from 'modules/admin/admin.navigation';
import {
  FILTER_PROPERTY,
  REFERENCE_FIELD,
  SHOW_DELETED_AT,
} from 'modules/admin/components.bundler';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import softDeleteHandler from 'modules/admin/hooks/soft-delete.handler';
import { Token } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { forAdminGroup } from '../user/user-permissions';

const createTokenResource = (): CreateResourceResult<typeof Token> => ({
  resource: Token,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['tokenId', 'assetId', 'contractId', 'createdAt'],
      showProperties: ['id', 'tokenId', 'assetId', 'contractId'],
      editProperties: ['assetId', 'contractId'],
      filterProperties: [],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: forAdminGroup,
      },
      show: {
        isAccessible: forAdminGroup,
      },
      edit: {
        isAccessible: forAdminGroup,
      },
      new: {
        isAccessible: forAdminGroup,
      },
      delete: {
        isAccessible: forAdminGroup,
        handler: softDeleteHandler,
      },
      bulkDelete: {
        isAccessible: forAdminGroup,
        handler: bulkSoftDeleteHandler,
      },
    },
    properties: {
      assetId: {
        type: 'reference',
        reference: 'Asset',
        components: {
          edit: REFERENCE_FIELD,
          filter: FILTER_PROPERTY,
        },
        custom: {
          searchProperty: 'name',
          resourceId: 'Asset',
          searchExclude: {
            'filters.isDeleted': false,
          },
        },
      },
      contractId: {
        type: 'reference',
        reference: 'Contract',
        components: {
          edit: REFERENCE_FIELD,
          filter: FILTER_PROPERTY,
        },
        custom: {
          searchProperty: 'name',
          resourceId: 'Contract',
          searchExclude: {
            'filters.isDeleted': false,
          },
        },
      },
      deletedAt: {
        isVisible: { edit: false, show: true, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        isVisible: { edit: false, show: true, filter: true },
      },
    },
  },
});

export default createTokenResource;
