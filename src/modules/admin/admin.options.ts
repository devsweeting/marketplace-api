/* eslint-disable @typescript-eslint/no-var-requires */
import { ConfigService } from '@nestjs/config';
import { PasswordService } from 'modules/auth/password.service';
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

AdminJS.registerAdapter({ Database, Resource });

const createAdmin = async (passwordService, configService: ConfigService) => {
  if ((await User.count({ role: RoleEnum.SUPER_ADMIN })) === 0) {
    const new_admin = User.create({
      email: configService.get('admin.default.adminEmail'),
      password: await passwordService.encode(configService.get('admin.default.adminPassword')),
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
    ],
    databases: [],
    locale,
  };
};

export const getAuth = (serviceAccessor: ServiceAccessor) => {
  const configService = serviceAccessor.getService(ConfigService);

  return {
    authenticate: async (email: string, password: string) => {
      const passwordService = serviceAccessor.getService(PasswordService);

      await createAdmin(passwordService, configService);

      const admin = await User.findOne({ where: { email } });

      if (admin && ![RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN].includes(admin.role)) return null;

      const passwordMatch = admin && (await passwordService.verify(admin.password, password));
      delete admin?.password;
      if (passwordMatch && admin) {
        return {
          ...admin,
          title: admin.role,
        };
      }

      return null;
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
