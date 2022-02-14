import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    default: {
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      dropSchema: process.env.NODE_ENV === 'test',
      synchronize:
        process.env.NODE_ENV !== 'production' &&
        (process.env.DATABASE_TYPEORM_SYNCHRONIZE || false),
      logging: process.env.NODE_ENV !== 'production',
      migrationsRun: false,
    },
  };
});
