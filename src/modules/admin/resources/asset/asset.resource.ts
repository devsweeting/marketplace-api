import {
  ATTRIBUTE_COMPONENT,
  PHOTO_PROPERTY,
  IMAGE_UPLOAD,
} from 'modules/admin/components.bundler';
import {
  SHOW_DELETED_AT,
  FILTER_PROPERTY,
  REFERENCE_FIELD,
} from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { loadAttributes } from './hooks/load-attributes.hook';
import { saveAttributes } from './hooks/save-attributes.hook';
import { LABELS_COMPONENT } from 'modules/admin/components.bundler';
import { saveLabels } from 'modules/admin/resources/asset/hooks/save-labels.hook';
import { getLabels } from './hooks/get-labels.hook';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';
import { softDeleteHandler } from 'modules/admin/hooks/soft-delete.handler';
import { ConfigService } from '@nestjs/config';
import uploadFile from 'modules/admin/hooks/upload-file.after';
import { marketNavigation } from 'modules/admin/admin.navigation';
import { MIME_TYPES } from '../file/mime-types';
import { getImage } from 'modules/admin/hooks/get-image.after';

const createAssetResource = (configService: ConfigService): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'name', 'partnerId', 'contractId', 'createdAt'],
    }),
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
        after: [saveLabels, saveAttributes, uploadFile('image', configService)],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [
          getImage(configService),
          getLabels,
          saveLabels,
          loadAttributes,
          saveAttributes,
          uploadFile('image', configService),
        ],
      },
      show: {
        after: [getImage(configService), getLabels, loadAttributes],
        isAccessible: (context): boolean => forAdminGroup(context),
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
        position: 12,
        isVisible: { edit: false, filter: true },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        isVisible: { edit: false, filter: true },
      },
      imageId: {
        isVisible: false,
      },
    },
  },
});

export default createAssetResource;
