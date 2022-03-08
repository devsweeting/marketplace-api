import { AdminModule } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import getAdminJSOptions from './admin.options';

export const adminjs = {
  module() {
    AdminJS.registerAdapter({ Database, Resource });
    return AdminModule.createAdmin({ ...getAdminJSOptions });
  },
};
