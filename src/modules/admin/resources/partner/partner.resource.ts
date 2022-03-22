import { CreateResourceResult } from '../create-resource-result.type';
import { Partner } from '../../../../modules/partners/entities';
import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { forAdminGroup } from '../user/user-permissions';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import softDeleteHandler from 'modules/admin/hooks/soft-delete.handler';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import { userAndOrgNavigation } from 'modules/admin/admin.navigation';
import { restoreHandler } from 'modules/admin/hooks/restore.handler';

const createPartnerResource = (): CreateResourceResult<typeof Partner> => ({
  resource: Partner,
  features: [
    (options): object => ({
      ...options,
      //   listProperties: ['name', 'updatedAt', 'createdAt'],
      //   editProperties: ['name', 'assets'],
      //   showProperties: ['id', 'name', 'updatedAt', 'createdAt'],
      //   filterProperties: ['name', 'updatedAt', 'createdAt'],
    }),
  ],
  options: {
    actions: {
      list: {
        isAccessible: forAdminGroup,
        before: [filterByIsDeleted],
      },
      show: {
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
      restore: {
        isAccessible: (context): boolean =>
          forAdminGroup(context) && context.record.params.deletedAt,
        actionType: 'record',
        variant: 'primary',
        icon: 'Renew',
        handler: restoreHandler,
        component: false,
      },
    },
    properties: {
      id: {
        position: 1,
      },
      name: {
        position: 2,
      },
      apiKey: {
        position: 3,
        isVisible: { edit: false, show: true },
      },
      deletedAt: {
        position: 4,
        isVisible: { edit: false, show: true, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        position: 5,
        isVisible: { edit: false, show: true, filter: true },
      },
      createdAt: {
        position: 6,
      },
      updatedAt: {
        position: 7,
      },
    },
    navigation: userAndOrgNavigation,
  },
});

export default createPartnerResource;
