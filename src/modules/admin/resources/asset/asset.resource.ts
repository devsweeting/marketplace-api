import {
  ATTRIBUTE_COMPONENT,
  FILTER_PROPERTY,
  IMAGE_UPLOAD,
  LABELS_COMPONENT,
  PHOTO_PROPERTY,
  REFERENCE_FIELD,
  SHOW_DELETED_AT,
  ASSET_SHOW,
} from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { loadAttributes } from './hooks/load-attributes.hook';
import { saveAttributes } from './hooks/save-attributes.hook';
import { saveLabels } from 'modules/admin/resources/asset/hooks/save-labels.hook';
import { getLabels } from './hooks/get-labels.hook';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import { softDeleteHandler } from 'modules/admin/hooks/soft-delete.handler';
import uploadFile from 'modules/admin/resources/asset/hooks/upload-file.after';
import { marketNavigation } from 'modules/admin/admin.navigation';
import { MIME_TYPES } from '../file/mime-types';
import { getImage } from 'modules/admin/hooks/get-image.after';
import { loadEvents } from './hooks/load-events.hook';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { softDeleteRelations } from './hooks/soft-delete-relations.hook';
import loggerFeature from '@adminjs/logger';
import loggerConfig from '@/src/config/logger.config';

const createAssetResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'partnerId', 'contractId', 'createdAt'],
    }),
    loggerFeature(loggerConfig),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [filterByIsDeleted],
      },
      new: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [saveLabels, saveAttributes, uploadFile('image', 'images/assets', serviceAccessor)],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [
          getImage(serviceAccessor),
          getLabels,
          saveLabels,
          loadAttributes,
          saveAttributes,
          uploadFile('image', 'images/assets', serviceAccessor),
        ],
      },
      show: {
        after: [getImage(serviceAccessor), getLabels, loadAttributes, loadEvents],
        isAccessible: (context): boolean => forAdminGroup(context),
        component: ASSET_SHOW,
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
      partnerId: {
        position: 1,
        type: 'reference',
        reference: 'Partner',
        components: {
          edit: REFERENCE_FIELD,
          filter: FILTER_PROPERTY,
        },
        custom: {
          searchProperty: 'name',
          resourceId: 'Partner',
        },
      },
      contractId: {
        position: 2,
        type: 'reference',
        reference: 'Contract',
        components: {
          edit: REFERENCE_FIELD,
          filter: FILTER_PROPERTY,
        },
        custom: {
          searchProperty: 'name',
          resourceId: 'Contract',
        },
      },
      name: {
        position: 3,
      },
      refId: {
        position: 4,
      },
      slug: {
        position: 5,
      },
      description: {
        position: 6,
        type: 'textarea',
      },
      externalUrl: {
        position: 7,
      },
      marketplace: {
        position: 8,
      },
      auctionType: {
        position: 9,
      },
      image: {
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
      assetAttributes: {
        position: 11,
        components: {
          edit: ATTRIBUTE_COMPONENT,
          show: ATTRIBUTE_COMPONENT,
        },
      },
      assetLabels: {
        position: 12,
        components: {
          edit: LABELS_COMPONENT,
          show: LABELS_COMPONENT,
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
      createdAt: {
        position: 52,
      },
      updatedAt: {
        position: 53,
      },
      events: {
        isVisible: false,
      },
      imageId: {
        isVisible: false,
      },
    },
  },
});

export default createAssetResource;
