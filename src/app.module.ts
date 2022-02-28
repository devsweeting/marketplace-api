/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from 'modules/partners';
import {
  PartnerAsset,
  Partner,
  AssetAttributes,
} from 'modules/partners/entities';
// import { adminjs } from './addons/adminjs';

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
    // adminjs.module(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
