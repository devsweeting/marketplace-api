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
import { createConnection } from 'typeorm';
import locale from './locale';

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

export const getAdminJSOptions = {
  adminJsOptions: {
    rootPath: '/admin',
    branding: {
      companyName: 'Jump.co',
      softwareBrothers: false,
    },
    resources: [
      createAssetResource(),
      createAttributeResource(),
      createPartnerResource(),
      createUserResource(),
    ],
    databases: [],
    locale,
  },
};

export const getAuth = (configService: ConfigService) => {
  return {
    authenticate: async (email: string, password: string) => {
      const passwordService = new PasswordService();

      await createAdmin(passwordService, configService);

      const admin = await User.findOne({ where: { email } });

      if (admin && ![RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.PARTNER].includes(admin.role))
        return null;

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

export const getSessionOptions = async (configService: ConfigService) => {
  const config = configService.get('database.default');
  const connection = await createConnection({
    ...config,
    entities: [Session],
  });
  const sessionRepository = connection.getRepository<SessionEntity>(Session);
  return {
    secret: configService.get('admin.default.sessionSecret'),
    store: new TypeormStore({ repository: sessionRepository }),
  };
};
