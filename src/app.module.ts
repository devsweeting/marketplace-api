import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from 'modules/partners';

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
        entities: [],
      }),
      inject: [ConfigService],
    }),
    PartnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
