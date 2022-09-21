import { DataSourceOptions } from 'typeorm';
import { migrations } from './migrations';
import { entities } from './entities';

export function getConfig(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: Number(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    dropSchema: process.env.NODE_ENV === 'test',
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    migrationsRun: process.env.TYPEORM_AUTOMIGRATION === 'true',
    migrations,
    entities,
  };
}
