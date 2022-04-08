import { CreateResourceResult } from '../create-resource-result.type';
import { Partner } from '../../../../modules/partners/entities';
import {
  FILTER_PROPERTY,
  IMAGE_UPLOAD,
  PHOTO_PROPERTY,
  REFERENCE_FIELD,
  SHOW_DELETED_AT,
} from 'modules/admin/components.bundler';
import { forAdminGroup } from '../user/user-permissions';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import softDeleteHandler from 'modules/admin/hooks/soft-delete.handler';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import { userAndOrgNavigation } from 'modules/admin/admin.navigation';
import { restoreHandler } from 'modules/admin/hooks/restore.handler';
import loggerFeature from '@adminjs/logger';
import loggerConfig from '@/src/config/logger.config';
import { MIME_TYPES } from '../file/mime-types';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { getImage } from './hooks/get-image.after';
import uploadFile from './hooks/upload-file.after';

const createPartnerResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Partner> => ({
  resource: Partner,
  features: [
    (options): object => ({
      ...options,
      //   listProperties: ['name', 'updatedAt', 'createdAt'],
      //   editProperties: ['name', 'assets'],
      //   showProperties: ['id', 'name', 'updatedAt', 'createdAt'],
      //   filterProperties: ['name', 'updatedAt', 'createdAt'],
    }),
    loggerFeature(loggerConfig),
  ],
  options: {
    actions: {
      list: {
        isAccessible: forAdminGroup,
        before: [filterByIsDeleted],
      },
      show: {
        isAccessible: forAdminGroup,
        after: [getImage(serviceAccessor)],
      },
      edit: {
        isAccessible: forAdminGroup,
        after: [
          getImage(serviceAccessor),
          uploadFile('avatar', 'partners/avatars', serviceAccessor),
          uploadFile('logo', 'partners/logos', serviceAccessor),
          uploadFile('banner', 'partners/banners', serviceAccessor),
        ],
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
      accountOwnerId: {
        position: 4,
        type: 'reference',
        reference: 'User',
        components: {
          edit: REFERENCE_FIELD,
          filter: FILTER_PROPERTY,
        },
        custom: {
          searchProperty: 'email',
          resourceId: 'User',
        },
      },
      avatar: {
        position: 5,
        isVisible: { edit: true, show: true, list: false, filter: false },
        props: {
          validation: {
            mimeTypes: MIME_TYPES,
          },
        },
        components: {
          edit: IMAGE_UPLOAD,
          show: PHOTO_PROPERTY,
          list: PHOTO_PROPERTY,
        },
      },
      logo: {
        position: 6,
        isVisible: { edit: true, show: true, list: false, filter: false },
        props: {
          validation: {
            mimeTypes: MIME_TYPES,
          },
        },
        components: {
          edit: IMAGE_UPLOAD,
          show: PHOTO_PROPERTY,
          list: PHOTO_PROPERTY,
        },
      },
      banner: {
        position: 7,
        isVisible: { edit: true, show: true, list: false, filter: false },
        props: {
          validation: {
            mimeTypes: MIME_TYPES,
          },
        },
        components: {
          edit: IMAGE_UPLOAD,
          show: PHOTO_PROPERTY,
          list: PHOTO_PROPERTY,
        },
      },
      deletedAt: {
        position: 8,
        isVisible: { edit: false, show: true, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        position: 9,
        isVisible: { edit: false, show: true, filter: true },
      },
      createdAt: {
        position: 10,
      },
      updatedAt: {
        position: 11,
      },
      avatarId: {
        isVisible: false,
      },
      logoId: {
        isVisible: false,
      },
      bannerId: {
        isVisible: false,
      },
    },
    navigation: userAndOrgNavigation,
  },
});

export default createPartnerResource;
