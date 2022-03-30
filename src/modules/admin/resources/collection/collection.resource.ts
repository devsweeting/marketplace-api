import { IMAGE_UPLOAD, PHOTO_PROPERTY, SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { CreateResourceResult } from '../create-resource-result.type';

import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import { softDeleteHandler } from 'modules/admin/hooks/soft-delete.handler';
import uploadFile from 'modules/admin/resources/collection/hooks/upload-file.after';
import { marketNavigation } from 'modules/admin/admin.navigation';
import { MIME_TYPES } from '../file/mime-types';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { softDeleteRelations } from './hooks/soft-delete-relations.hook';
import { Collection } from 'modules/collections/entities';
import { getBanner } from './hooks/get-banner.after';

const createCollectionResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Collection> => ({
  resource: Collection,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['banner', 'name', 'slug', 'createdAt'],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [filterByIsDeleted],
        after: [getBanner(serviceAccessor)],
      },
      new: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [uploadFile('banner', 'images/collections', serviceAccessor)],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [
          getBanner(serviceAccessor),
          uploadFile('banner', 'images/collections', serviceAccessor),
        ],
      },
      show: {
        after: [getBanner(serviceAccessor)],
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      delete: {
        isAccessible: (context): boolean =>
          forAdminGroup(context) && !context.record.params.deletedAt,
        handler: softDeleteHandler,
        after: [softDeleteRelations],
      },
      bulkDelete: {
        isAccessible: (context): boolean =>
          forAdminGroup(context) && !context.record.params.deletedAt,
        handler: bulkSoftDeleteHandler,
        after: [softDeleteRelations],
      },
    },
    properties: {
      name: {
        position: 3,
      },
      slug: {
        position: 5,
      },
      description: {
        position: 6,
        type: 'textarea',
      },
      banner: {
        position: 10,
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
        position: 12,
        isVisible: { edit: false, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        isVisible: { edit: false, filter: true },
      },
      bannerId: {
        isVisible: false,
      },
    },
  },
});

export default createCollectionResource;
