/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigService } from '@nestjs/config';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { User } from 'modules/users/user.entity';
import createAssetResource from './resources/asset/asset.resource';
import createAttributeResource from './resources/attribute/attribute.resource';
import createPartnerResource from './resources/partner/partner.resource';
import createUserResource from './resources/user/user.resource';
import { SessionEntity, TypeormStore } from 'typeorm-store';
import { Session } from 'modules/auth/session/session.entity';
import { getRepository } from 'typeorm';
import createContractResource from 'modules/admin/resources/contract/contract.resource';
import createEventResource from './resources/events/event.resource';
import locale from './locale';
import createFileResource from './resources/file/file.resource';
import { ServiceAccessor } from 'modules/admin/utils/service.accessor';
import AdminJS, { AdminJSOptions } from 'adminjs';
import { Database, Resource } from '@adminjs/typeorm';
import createTokenResource from './resources/token/token.resource';

AdminJS.registerAdapter({ Database, Resource });

const createAdmin = async (configService: ConfigService) => {
  if ((await User.count({ role: RoleEnum.SUPER_ADMIN })) === 0) {
    const new_admin = User.create({
      email: configService.get('admin.default.adminEmail'),
      address: configService.get('admin.default.adminAddress'),
      role: RoleEnum.SUPER_ADMIN,
    });
    await new_admin.save();
  }
};

export const getAdminJSOptions = (serviceAccessor: ServiceAccessor): AdminJSOptions => {
  return {
    rootPath: '/admin',
    branding: {
      companyName: 'Jump.co',
      softwareBrothers: false,
      logo: '/logo.svg',
    },
    resources: [
      createAssetResource(serviceAccessor),
      createAttributeResource(),
      createPartnerResource(),
      createContractResource(),
      createUserResource(),
      createFileResource(),
      createEventResource(),
      createTokenResource(),
    ],
    databases: [],
    locale,
  };
};

export const getAuth = (serviceAccessor: ServiceAccessor) => {
  const configService = serviceAccessor.getService(ConfigService);

  return {
    authenticate: async (address: string) => {
      await createAdmin(configService);

      const admin = await User.findOne({ where: { address, isDeleted: false } });

      if (!admin || ![RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN].includes(admin.role)) return null;

      return {
        ...admin,
        title: admin.role,
      };
    },
    cookiePassword: configService.get('admin.default.cookiePassword'),
    cookieName: configService.get('admin.default.cookieName'),
  };
};

interface SessionOptionsInterface {
  secret: string;
  store: TypeormStore;
}

export const getSessionOptions = async (
  serviceAccessor: ServiceAccessor,
): Promise<SessionOptionsInterface> => {
  const configService = serviceAccessor.getService(ConfigService);

  return {
    secret: configService.get('admin.default.sessionSecret'),
    store: new TypeormStore({ repository: getRepository<SessionEntity>(Session) }),
  };
};
