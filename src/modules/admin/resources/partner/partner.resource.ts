import { CreateResourceResult } from '../create-resource-result.type';
import { Partner } from '../../../../modules/partners/entities';
import { userAndOrgNavigation } from 'modules/admin/admin.navigation';

const createPartnerResource = (): CreateResourceResult<typeof Partner> => ({
  resource: Partner,
  features: [
    (options): object => ({
      ...options,
      //   listProperties: ['name', 'updatedAt', 'createdAt'],
      //   editProperties: ['name', 'assets'],
      //   showProperties: ['id', 'name', 'updatedAt', 'createdAt'],
      //   filterProperties: ['name', 'updatedAt', 'createdAt'],
    }),
  ],
  options: {
    navigation: userAndOrgNavigation,
  },
});

export default createPartnerResource;
