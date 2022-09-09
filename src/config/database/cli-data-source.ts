import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { getConfig } from './config';

ConfigModule.forRoot({
  expandVariables: true,
  envFilePath: [
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.local',
    '.env',
  ],
});

export default new DataSource(getConfig());
