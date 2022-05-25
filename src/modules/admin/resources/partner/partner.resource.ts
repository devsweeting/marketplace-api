import { CreateResourceResult } from '../create-resource-result.type';
import { Partner } from '../../../../modules/partners/entities';
import {
  FILTER_PROPERTY,
  IMAGE_UPLOAD,
  PHOTO_PROPERTY,
  REFERENCE_FIELD,
  SHOW_DELETED_AT,
  HASHED_ID_PROPERTY,
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
import { getHashedId } from './hooks/get-hashed-id.after';

const imageProperty = {
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
};

const createPartnerResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Partner> => ({
  resource: Partner,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['id', 'name', 'hashedId', 'apiKey', 'updatedAt', 'createdAt'],
      editProperties: ['name', 'accountOwnerId', 'avatar', 'logo', 'banner'],
      showProperties: [
        'id',
        'hashedId',
        'name',
        'apiKey',
        'accountOwnerId',
        'avatar',
        'logo',
        'banner',
        'updatedAt',
        'createdAt',
        'deletedAt',
        'isDeleted',
      ],
      filterProperties: ['name', 'hashedId', 'updatedAt', 'createdAt', 'deletedAt', 'isDeleted'],
    }),
    loggerFeature(loggerConfig),
  ],
  options: {
    actions: {
      list: {
        isAccessible: forAdminGroup,
        after: [getHashedId(serviceAccessor)],
        before: [filterByIsDeleted],
      },
      show: {
        isAccessible: forAdminGroup,
        after: [getHashedId(serviceAccessor), getImage(serviceAccessor)],
      },
      new: {
        isAccessible: forAdminGroup,
        after: [
          uploadFile('avatar', 'partners/avatars', serviceAccessor),
          uploadFile('logo', 'partners/logos', serviceAccessor),
          uploadFile('banner', 'partners/banners', serviceAccessor),
        ],
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
      hashedId: {
        components: {
          show: HASHED_ID_PROPERTY,
        },
      },
      accountOwnerId: {
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
        ...imageProperty,
      },
      logo: {
        ...imageProperty,
      },
      banner: {
        ...imageProperty,
      },
      deletedAt: {
        components: {
          show: SHOW_DELETED_AT,
        },
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
