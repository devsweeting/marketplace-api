import { AdminModule, AdminModuleOptions, CustomLoader } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import { Attribute, Partner, Asset } from '../modules/partners/entities';

const adminOptions: AdminModuleOptions & CustomLoader = {
  adminJsOptions: {
    rootPath: '/admin',
    branding: {
      companyName: 'Jump.co',
    },
    /* eslint-disable */
    resources: [
      {
        resource: Asset,
        options: {
          listProperties: ['name', 'refId', 'description', 'partner', 'updatedAt', 'createdAt'],
          // editProperties: ['name', 'refId', 'description', 'slug', 'image', 'attributes', 'partner'],
          // showProperties: ['id', 'name', 'refId', 'description', 'slug', 'image', 'updatedAt', 'createdAt'],
          // filterProperties: ['name', 'refId', 'description', 'updatedAt', 'createdAt'],
        },
      },
      {
        resource: Attribute,
        options: {
          listProperties: ['trait', 'value', 'updatedAt', 'createdAt'],
          // editProperties: ['trait', 'value', 'asset'],
          // showProperties: ['id', 'trait', 'value', 'assetId', 'updatedAt', 'createdAt'],
          // filterProperties: ['trait', 'value', 'updatedAt', 'createdAt'],
        },
      },
      {
        resource: Partner,
        // options: {
        //   listProperties: ['name', 'updatedAt', 'createdAt'],
        //   editProperties: ['name', 'assets'],
        //   showProperties: ['id', 'name', 'updatedAt', 'createdAt'],
        //   filterProperties: ['name', 'updatedAt', 'createdAt'],
        // },
      },
    ],
    /* eslint-enable */
  },
};

export const adminjs = {
  module() {
    if (process.env.NODE_ENV == 'DEVELOP') {
      AdminJS.registerAdapter({ Database, Resource });
      return AdminModule.createAdmin(adminOptions);
    }
  },
};
