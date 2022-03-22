import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { Event } from 'modules/events/entities';
import { CreateResourceResult } from '../create-resource-result.type';

import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';

import { marketNavigation } from 'modules/admin/admin.navigation';

const createEventResource = (): CreateResourceResult<typeof Event> => ({
  resource: Event,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['assetId', 'fromAddress', 'quantity', 'totalPrice', 'isPrivate'],
      showProperties: [
        'assetId',
        'fromAddress',
        'toAddress',
        'quantity',
        'totalPrice',
        'paymentToken',
        'eventType',
        'isPrivate',
      ],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [filterByIsDeleted],
      },
      show: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      new: {
        isAccessible: false,
      },
      edit: {
        isAccessible: false,
      },
      delete: {
        isAccessible: false,
      },
      bulkDelete: {
        isAccessible: false,
      },
    },
    properties: {
      deletedAt: {
        position: 12,
        isVisible: { edit: false, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        isVisible: { edit: false, filter: true },
      },
      updatedAt: {
        isVisible: false,
      },
    },
  },
});

export default createEventResource;
