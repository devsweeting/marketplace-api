/* eslint-disable prettier/prettier */
import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PartnersModule} from 'modules/partners/partners.module';
import {Asset, Attribute, Partner,} from 'modules/partners/entities';
import {AuthModule} from 'modules/auth/auth.module';

@Module({
  imports: [
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
        entities: [Asset, Attribute, Partner],
      }),
      inject: [ConfigService],
    }),
    PartnersModule,
    // adminjs.module(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
