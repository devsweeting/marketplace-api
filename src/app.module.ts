import { Module } from '@nestjs/common';
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
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute, Label, Contract } from 'modules/assets/entities';
import { Session } from 'modules/auth/session/session.entity';

const appModules = [
  AuthModule,
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
      entities: [User, Partner, Asset, Attribute, Label, Contract, Session],
    }),
    inject: [ConfigService],
  }),
];
if (process.env.NODE_ENV == 'DEVELOP' || process.env.NODE_ENV == 'ADMIN') {
  appModules.push(adminjs.module());
}

if (process.env.NODE_ENV != 'DEVELOP' && process.env.NODE_ENV != 'test') {
  appModules.push(MailModule);
}
@Module({
  imports: [...appModules, PartnersModule, AssetsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
