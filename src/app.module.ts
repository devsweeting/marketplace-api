import { MiddlewareConsumer, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-rollbar';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from 'modules/partners/partners.module';
import { AuthModule } from 'modules/auth/auth.module';
import { UsersModule } from 'modules/users/users.module';

import { MailModule } from 'modules/mail/mail.module';
import { AssetsModule } from 'modules/assets/assets.module';
import { join } from 'path';
import { StorageModule } from 'modules/storage/storage.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { HealthModule } from './modules/health/health.module';

import { WatchlistsModule } from './modules/watchlists/watchlists.module';
import { SellOrdersModule } from './modules/sell-orders/sell-orders.module';
import LogsMiddleware from './middleware/logs.middleware';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { PortfolioModule } from './modules/portfolio/portfolio.module';

const modules = [];

if (process.env.NODE_ENV === 'STAGING' || process.env.NODE_ENV === 'PRODUCTION') {
  modules.push(
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          accessToken: configService.get('rollbar.default.rollbarToken'),
          environment: configService.get('rollbar.default.rollbarEnvironment'),
          captureUncaught: true,
          captureUnhandledRejections: true,
          captureEmail: true,
          captureUsername: true,
        };
      },
    }),
  );
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        '.env.local',
        '.env',
      ],
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      load: Object.values(require('./config')),
    }),
    SentryModule.forRoot({
      dsn: process.env.SENTRY_DSN, // Disabled if left blank
      debug: true,
      environment: process.env.SENTRY_ENV || 'dev',
      tracesSampleRate: process.env.SENTRY_SAMPLE_RATE
        ? parseFloat(process.env.SENTRY_SAMPLE_RATE)
        : 1.0,
    }),
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => configService.get('database.default'),
    }),
    MailModule,
    StorageModule,
    PartnersModule,
    AssetsModule,
    UsersModule,
    CollectionsModule,
    WatchlistsModule,
    HealthModule,
    SellOrdersModule,
    PortfolioModule,
    ...modules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
