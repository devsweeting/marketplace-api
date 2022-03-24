import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from 'modules/partners/partners.module';
import { AuthModule } from 'modules/auth/auth.module';
import { UsersModule } from 'modules/users/users.module';

import { adminjs } from 'modules/admin/admin.config';
import { MailModule } from 'modules/mail/mail.module';
import { AssetsModule } from 'modules/assets/assets.module';
import { User } from 'modules/users/user.entity';
import { Partner, PartnerMemberUser } from 'modules/partners/entities';
import { Asset, Attribute, Label, Contract } from 'modules/assets/entities';
import { Session } from 'modules/auth/session/session.entity';
import { join } from 'path';
import { StorageModule } from 'modules/storage/storage.module';
import { File } from 'modules/storage/file.entity';
import { EventModule } from 'modules/events/event.module';
import { Event } from 'modules/events/entities';

const appModules = [
  AuthModule,
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }),
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: [
      `.env.${process.env.NODE_ENV}.local`,
      `.env.${process.env.NODE_ENV}`,
      '.env.local',
      '.env',
    ],
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    load: Object.values(require('./config')),
  }),
  TypeOrmModule.forRootAsync({
    useFactory: async (configService: ConfigService) => ({
      ...configService.get('database.default'),
      entities: [
        User,
        Partner,
        PartnerMemberUser,
        Asset,
        Attribute,
        Label,
        Contract,
        Session,
        File,
        Event,
      ],
    }),
    inject: [ConfigService],
  }),
  StorageModule,
];
if (process.env.NODE_ENV == 'DEVELOP' || process.env.NODE_ENV == 'ADMIN') {
  appModules.push(adminjs.module());
}

if (process.env.NODE_ENV != 'DEVELOP' && process.env.NODE_ENV != 'test') {
  appModules.push(MailModule);
}
@Module({
  imports: [...appModules, PartnersModule, AssetsModule, EventModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
