import { ATTRIBUTE_PROPERTY, PHOTO_PROPERTY } from 'modules/admin/components.bundler';
import { SHOW_DELETED_AT } from 'modules/admin/components.bundler';
import { Asset } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { loadAttributes } from './hooks/load-attributes.hook';
import { saveAttributes } from './hooks/save-attributes.hook';
import { LABELS_COMPONENT } from 'modules/admin/components.bundler';
import { saveLabels } from 'modules/admin/resources/asset/hooks/save-labels.hook';
import { getLabels } from './hooks/get-labels.hook';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';
import uploadFeature from '@adminjs/upload';
import { ConfigService } from '@nestjs/config';

const createAssetResource = (configService: ConfigService): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'description', 'partnerId', 'updatedAt', 'createdAt'],
    }),
    uploadFeature({
      provider: {
        aws: {
          bucket: configService.get('aws.default.bucket'),
          accessKeyId: configService.get('aws.default.accessKeyId'),
          secretAccessKey: configService.get('aws.default.secretAccessKey'),
          region: configService.get('aws.default.region'),
        },
      },
      properties: {
        file: 'image.file',
        filePath: 'image.filePath',
        filename: 'image.filename',
        filesToDelete: 'image.toDelete',
        key: 'image.s3Key',
        bucket: 'image.bucket',
        mimeType: 'image.mime',
      },
      uploadPath: (record, filename) => `assets/${record.id()}/images/${filename}`,
      validation: { mimeTypes: ['image/png', 'image/jpeg'] },
    }),
  ],
  options: {
    actions: {
      new: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [saveLabels, saveAttributes],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [getLabels, saveLabels, loadAttributes, saveAttributes],
      },
      show: {
        after: [getLabels, loadAttributes],
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
      name: {
        position: 2,
      },
      refId: {
        position: 3,
      },
      slug: {
        position: 4,
      },
      description: {
        position: 5,
      },
      externalUrl: {
        position: 6,
      },
      marketplace: {
        position: 7,
      },
      auctionType: {
        position: 8,
      },
      image: {
        position: 9,
        // components: {
        //   show: PHOTO_PROPERTY,
        //   list: PHOTO_PROPERTY,
        // },
      },
      labels: {
        position: 10,
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
    },
  },
});

export default createAssetResource;
