import { CreateResourceResult } from '../create-resource-result.type';
import { User } from '../../../users/user.entity';
import passwordFeature from '@adminjs/passwords';
import bcrypt from 'bcryptjs';
import { forAdminGroup, forSuperAdmins } from './user-permissions';

const baseProperties = ['email', 'role'];

function hash(newPassword: string) {
  return bcrypt.hash(newPassword, 10);
}

const createUserResource = (): CreateResourceResult<typeof User> => ({
  resource: User,
  features: [
    (options): object => ({
      ...options,
      listProperties: [...baseProperties],
      editProperties: [...baseProperties, 'firstName', 'lastName', 'newPassword'],
      showProperties: ['id', ...baseProperties, 'createdAt', 'updatedAt'],
      filterProperties: [
        'id',
        ...baseProperties,
        'firstName',
        'lastName',
        'createdAt',
        'updatedAt',
      ],
    }),
    passwordFeature({
      properties: {
        encryptedPassword: 'password',
        password: 'newPassword',
      },
      hash,
    }),
  ],
  options: {
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      show: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      new: {
        isAccessible: (context): boolean => forSuperAdmins(context),
      },
      edit: {
        isAccessible: (context): boolean => forAdminGroup(context),
      },
      delete: {
        isAccessible: (context): boolean =>
          forSuperAdmins(context) && !context.record.params.deletedAt,
      },
      bulkDelete: {
        isAccessible: (context): boolean =>
          forSuperAdmins(context) && !context.record.params.deletedAt,
      },
    },
    properties: {
      email: { isRequired: true },
      role: { isRequired: true },
      password: { isVisible: false },
    },
  },
});

export default createUserResource;
