import { ConnectionOptions } from 'typeorm';

module.exports = {
  type: process.env.TYPEORM_CONNECTION,
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  dropSchema: process.env.NODE_ENV === 'test',
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'false',
  logging: process.env.TYPEORM_LOGGING,
  migrationsRun: process.env.TYPEORM_AUTOMIGRATION === 'true',
  migrations: [process.env.TYPEORM_MIGRATIONS],
  autoLoadEntities: false,
  keepConnectionAlive: true,
  cli: {
    migrationsDir: 'src/config/database/migrations',
  },
  entities: ['src/modules/**/entities/*.entity.ts'],
} as ConnectionOptions;
