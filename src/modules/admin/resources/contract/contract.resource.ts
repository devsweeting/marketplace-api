import { Contract } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import softDeleteHandler from 'modules/admin/hooks/soft-delete.handler';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import { marketNavigation } from 'modules/admin/admin.navigation';

const createContractResource = (): CreateResourceResult<typeof Contract> => ({
  resource: Contract,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['address', 'name', 'symbol', 'externalLink'],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: forAdminGroup,
        before: [filterByIsDeleted],
      },
      show: {
        isAccessible: forAdminGroup,
      },
      new: {
        isAccessible: forAdminGroup,
      },
      edit: {
        isAccessible: forAdminGroup,
      },
      delete: {
        isAccessible: (context): boolean =>
          forAdminGroup(context) && !context.record.params.deletedAt,
        handler: softDeleteHandler,
      },
      bulkDelete: {
        isAccessible: (context): boolean =>
          forAdminGroup(context) && !context.record.params.deletedAt,
        handler: bulkSoftDeleteHandler,
      },
    },
    properties: {
      address: {
        position: 1,
        isRequired: true,
      },
      name: {
        position: 2,
        isRequired: true,
      },
      symbol: {
        position: 3,
        isRequired: true,
      },
      image: {
        position: 4,
      },
      externalLink: {
        position: 5,
      },
      description: {
        position: 6,
        type: 'textarea',
      },
      deletedAt: {
        position: 7,
        isVisible: { edit: false, show: true, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        position: 8,
        isVisible: { edit: false, show: true, filter: true },
      },
    },
  },
});

export default createContractResource;
