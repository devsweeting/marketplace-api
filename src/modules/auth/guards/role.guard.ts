import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { RoleEnum } from 'modules/users/enums/role.enum';
import IRequestWithUser from '../interfaces/request-with-user.interface';
import JwtAuthGuard from './jwt-auth.guard';

const RoleGuard = (roles: RoleEnum[]): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<IRequestWithUser>();

      return roles.includes(request?.user?.role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
