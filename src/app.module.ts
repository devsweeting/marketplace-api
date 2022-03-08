/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from './modules/partners/partners.module';
import {
  Asset,
  Partner,
  Attribute,
} from './modules/partners/entities';
import { AuthMiddleware } from './middleware/auth';
import { AuthModule } from 'modules/auth/auth.module';
import { adminjs } from 'modules/admin/admin.config';

const appModules = [AuthModule,
  ConfigModule.forRoot({
    isGlobal: true,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    load: Object.values(require('./config')),
  }),
  TypeOrmModule.forRootAsync({
    useFactory: async (configService: ConfigService) => ({
      ...configService.get('database').default,
      entities: [Asset, Attribute, Partner],
    }),
    inject: [ConfigService],
  }),
  PartnersModule,
]
if(process.env.NODE_ENV == 'DEVELOP' || process.env.NODE_ENV == 'ADMIN') {
  appModules.push(adminjs.module())
}
@Module({
  imports: [...appModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
    .forRoutes('')
  }
}

