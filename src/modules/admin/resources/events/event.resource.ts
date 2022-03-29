import { Event } from 'modules/events/entities';
import { CreateResourceResult } from '../create-resource-result.type';

import { marketNavigation } from 'modules/admin/admin.navigation';

const createEventResource = (): CreateResourceResult<typeof Event> => ({
  resource: Event,
  features: [
    (options): object => ({
      ...options,
      listProperties: [],
      showProperties: [],
    }),
  ],
  options: {
    navigation: marketNavigation,
    actions: {
      list: {
        isAccessible: false,
      },
      show: {
        isAccessible: false,
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
  },
});

export default createEventResource;
