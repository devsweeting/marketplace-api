import { AdminModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import { ConfigService } from '@nestjs/config';
import AdminJS from 'adminjs';
import { getAdminJSOptions, getAuth } from './admin.options';

export const adminjs = {
  module() {
    AdminJS.registerAdapter({ Database, Resource });
    return AdminModule.createAdminAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getAdminJSOptions,
        auth: getAuth(configService),
      }),
    });
  },
};
