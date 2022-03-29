import { ActionContext, IsFunction } from 'adminjs';
import { User } from '../../../users/user.entity';
import { RoleEnum } from '../../../users/enums/role.enum';

export const forSelf: IsFunction = (context: ActionContext): boolean => {
  const user = context.currentAdmin || ({} as User);

  return (
    [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN].includes(user.role) ||
    context.record.params.id === user.id
  );
};

export const forSuperAdmins: IsFunction = (context: ActionContext): boolean => {
  const user = context.currentAdmin || ({} as User);

  return [RoleEnum.SUPER_ADMIN].includes(user.role);
};

export const forAdmins: IsFunction = (context: ActionContext): boolean => {
  const user = context.currentAdmin || ({} as User);

  return [RoleEnum.ADMIN].includes(user.role);
};

export const forAdminGroup: IsFunction = (context: ActionContext): boolean => {
  const user = context.currentAdmin || ({} as User);

  return [RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN].includes(user.role);
};
