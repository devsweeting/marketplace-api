import { AdminModule, AdminModuleOptions, CustomLoader } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import {
  AssetAttributes,
  Partner,
  PartnerAsset,
} from 'modules/partners/entities';

const adminOptions: AdminModuleOptions & CustomLoader = {
  adminJsOptions: {
    rootPath: '/admin',
    branding: {
      companyName: 'Fractionalist',
      softwareBrothers: false,
    },
    /* eslint-disable */
    resources: [
      {
        resource: PartnerAsset,
        options: {
          // listProperties: ['name', 'refId', 'description', 'updatedAt', 'createdAt'],
          // editProperties: ['name', 'refId', 'description', 'slug', 'image', 'attributes'],
          // showProperties: ['id', 'name', 'refId', 'description', 'slug', 'image', 'updatedAt', 'createdAt'],
          // filterProperties: ['name', 'refId', 'description', 'updatedAt', 'createdAt'],
        },
      },
      {
        resource: AssetAttributes,
        options: {
          // listProperties: ['trait', 'value', 'updatedAt', 'createdAt'],
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
