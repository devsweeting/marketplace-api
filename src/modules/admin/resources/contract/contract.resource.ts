import { Contract } from 'modules/assets/entities';
import { CreateResourceResult } from '../create-resource-result.type';
import { forAdminGroup } from 'modules/admin/resources/user/user-permissions';

const createContractResource = (): CreateResourceResult<typeof Contract> => ({
  resource: Contract,
  features: [
    (options): object => ({
      ...options,
      listProperties: ['address', 'name', 'symbol', 'externalLink'],
    }),
  ],
  options: {
    actions: {
      new: {
        isAccessible: forAdminGroup,
      },
      edit: {
        isAccessible: forAdminGroup,
      },
    },
    properties: {
      address: {
        position: 1,
        isRequired: true,
      },
      name: {
        position: 2,
        isRequired: true,
      },
      symbol: {
        position: 3,
        isRequired: true,
      },
      image: {
        position: 4,
      },
      externalLink: {
        position: 5,
      },
      description: {
        position: 6,
        type: 'richtext',
      },
    },
  },
});

export default createContractResource;
