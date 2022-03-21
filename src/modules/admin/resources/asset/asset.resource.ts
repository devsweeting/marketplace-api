import { ATTRIBUTE_PROPERTY, PHOTO_PROPERTY, IMAGE_UPLOAD } from 'modules/admin/components.bundler';
import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { loadAttributes } from './hooks/load-attributes.hook';
import { saveAttributes } from './hooks/save-attributes.hook';
import { LABELS_COMPONENT } from 'modules/admin/components.bundler';
import { saveLabels } from 'modules/admin/resources/asset/hooks/save-labels.hook';
import { getLabels } from './hooks/get-labels.hook';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
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
      listProperties: ['name', 'refId', 'partnerId', 'contractId', 'createdAt'],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
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
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      bulkDelete: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
    },
    properties: {
      partnerId: {
        position: 1,
      },
      contractId: {
        position: 2,
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
      labels: {
        position: 11,
        components: {
          edit: LABELS_COMPONENT,
          show: LABELS_COMPONENT,
        },
      },
      assetAttributes: {
        position: 11,
        components: {
          edit: ATTRIBUTE_PROPERTY,
          show: ATTRIBUTE_PROPERTY,
        },
      },
      deletedAt: {
        position: 12,
        isVisible: { edit: false },
        components: {
          show: SHOW_DELETED_AT,
        },
      },
      isDeleted: {
        isVisible: { edit: false },
      },
      imageId: {
        isVisible: false,
      },
    },
  },
});

export default createAssetResource;
