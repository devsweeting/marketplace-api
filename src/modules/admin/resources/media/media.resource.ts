import { CreateResourceResult } from '../create-resource-result.type';
import { Media } from 'modules/assets/entities';
import { marketNavigation } from 'modules/admin/admin.navigation';
import { forAdminGroup } from '../user/user-permissions';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import softDeleteHandler from 'modules/admin/hooks/soft-delete.handler';
import { IMAGE_UPLOAD, PHOTO_PROPERTY, SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { MIME_TYPES } from '../file/mime-types';
import { validate } from './hooks/validate.before';
import uploadFile from './hooks/upload-file.after';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { getImage } from 'modules/admin/hooks/get-image.after';

const createMediaResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Media> => ({
  resource: Media,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['file', 'title', 'type', 'assetId', 'sortOrder'],
      showProperties: [],
      editProperties: ['assetId', 'type', 'title', 'description', 'file', 'url', 'sortOrder'],
      filterProperties: [],
    }),
  ],
  options: {
    navigation: marketNavigation,
    sort: {
      direction: 'asc',
      sortBy: 'sortOrder',
    },
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [getImage(serviceAccessor, 'file')],
      },
      show: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [getImage(serviceAccessor, 'file')],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [validate()],
        after: [getImage(serviceAccessor, 'file'), uploadFile('file', 'assets/', serviceAccessor)],
      },
      new: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [validate()],
        after: [uploadFile('file', 'assets/', serviceAccessor)],
      },
      delete: {
        isAccessible: (context): boolean => forAdminGroup(context),
        handler: softDeleteHandler,
      },
      bulkDelete: {
        isAccessible: (context): boolean => forAdminGroup(context),
        handler: bulkSoftDeleteHandler,
      },
    },
    properties: {
      assetId: { isRequired: true },
      title: { isRequired: true },
      sortOrder: { isRequired: true },
      type: { isRequired: true },
      url: { isRequired: true },
      file: {
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
        position: 50,
        isVisible: { edit: false, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        position: 51,
        isVisible: { edit: false, filter: true },
      },
    },
  },
});

export default createMediaResource;
