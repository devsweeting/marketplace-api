import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from 'modules/partners';
import { PartnerAsset, Partner, AssetAttributes } from 'modules/partners/entities';
import { AdminModule, AdminModuleOptions, CustomLoader } from '@adminjs/nestjs';
import { Database, Resource } from '@adminjs/typeorm';
import AdminJS from 'adminjs';

AdminJS.registerAdapter({ Database, Resource });

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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      load: Object.values(require('./config')),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database').default,
        entities: [PartnerAsset, AssetAttributes, Partner],
      }),
      inject: [ConfigService],
    }),
    PartnersModule,
    AdminModule.createAdmin(adminOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
