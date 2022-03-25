import { CreateResourceResult } from '../create-resource-result.type';
import { User } from '../../../users/user.entity';
import passwordFeature from '@adminjs/passwords';
import bcrypt from 'bcryptjs';
import { forAdminGroup, forSuperAdmins } from './user-permissions';
import { restoreHandler } from '../../hooks/restore.handler';
import { deleteHandler } from './handlers/delete.handler';
import { SHOW_DELETED_AT } from '../../components.bundler';
import { filterByIsDeleted } from 'modules/admin/hooks/filter-is-deleted-records';
import { userAndOrgNavigation } from 'modules/admin/admin.navigation';
import bulkSoftDeleteHandler from 'modules/admin/hooks/bulk-soft-delete.handler';

const baseProperties = ['email', 'firstName', 'lastName', 'address', 'role'];

function hash(newPassword: string) {
  return bcrypt.hash(newPassword, 10);
}

const createUserResource = (): CreateResourceResult<typeof User> => ({
  resource: User,
  features: [
    (options): object => ({
      ...options,
      listProperties: [...baseProperties],
      editProperties: [...baseProperties, 'newPassword'],
      showProperties: ['id', ...baseProperties, 'createdAt', 'updatedAt', 'deletedAt', 'isDeleted'],
      filterProperties: [
        'id',
        ...baseProperties,
        'createdAt',
        'updatedAt',
        'deletedAt',
        'isDeleted',
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
    navigation: userAndOrgNavigation,
    actions: {
      list: {
        isAccessible: (context): boolean => forAdminGroup(context),
        before: [filterByIsDeleted],
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
          forSuperAdmins(context) &&
          !context.record.params.deletedAt &&
          context.record.params.id !== context.currentAdmin.id,
        handler: deleteHandler,
      },
      bulkDelete: {
        isAccessible: (context): boolean =>
          forSuperAdmins(context) &&
          !context.record.params.deletedAt &&
          context.record.params.id !== context.currentAdmin.id,
        handler: bulkSoftDeleteHandler,
      },
      restore: {
        isAccessible: (context): boolean =>
          forSuperAdmins(context) && context.record.params.deletedAt,
        actionType: 'record',
        variant: 'primary',
        icon: 'Renew',
        handler: restoreHandler,
        component: false,
      },
    },
    properties: {
      email: { isRequired: true },
      role: { isRequired: true },
      password: { isVisible: false },
      deletedAt: {
        components: {
          show: SHOW_DELETED_AT,
        },
      },
    },
  },
});

export default createUserResource;
