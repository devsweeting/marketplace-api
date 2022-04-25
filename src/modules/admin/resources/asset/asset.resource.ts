import {
  ASSET_SHOW,
  ATTRIBUTE_COMPONENT,
  FILTER_PROPERTY,
  LABELS_COMPONENT,
  REFERENCE_FIELD,
  SHOW_DELETED_AT,
  MEDIA_BOX_COMPONENT,
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
import { marketNavigation } from 'modules/admin/admin.navigation';
import { MIME_TYPES } from '../file/mime-types';

import { loadEvents } from './hooks/load-events.hook';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import { softDeleteRelations } from './hooks/soft-delete-relations.hook';
import loggerFeature from '@adminjs/logger';
import loggerConfig from '@/src/config/logger.config';
import { loadMedia } from './hooks/load-media.hook';
import saveMedia from 'modules/admin/resources/asset/hooks/save-media.after';
import { validate } from './hooks/validate';

const createAssetResource = (
  serviceAccessor: ServiceAccessor,
): CreateResourceResult<typeof Asset> => ({
  resource: Asset,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['name', 'refId', 'partnerId', 'createdAt'],
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
        after: [saveLabels, saveAttributes, saveMedia(serviceAccessor)],
        before: [validate(serviceAccessor)],
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
        after: [
          loadMedia(serviceAccessor),
          getLabels,
          saveLabels,
          loadAttributes,
          saveAttributes,
          saveMedia(serviceAccessor),
        ],
        before: [validate(serviceAccessor)],
      },
      show: {
        after: [loadMedia(serviceAccessor), getLabels, loadAttributes, loadEvents],
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
          searchExclude: {
            'filters.isDeleted': false,
          },
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
      assetMedia: {
        position: 10,
        props: {
          validation: {
            mimeTypes: MIME_TYPES,
          },
        },
        components: {
          edit: MEDIA_BOX_COMPONENT,
          show: MEDIA_BOX_COMPONENT,
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
    },
  },
});

export default createAssetResource;
