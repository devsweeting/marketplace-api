import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

import { AppModule } from './app.module';

import { setupSwaggerModule } from './setupSwaggerModule';
import { setupFixtures } from './fixtures';

import rawBodyMiddleware from './middleware/raw-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(rawBodyMiddleware());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  setupSwaggerModule({ app });

  const configService = app.get(ConfigService);
  const serverConfig = configService.get('server').default;
  const port = serverConfig.port;

  await app.listen(port);

  setupFixtures();

  // tslint:disable-next-line: no-console
  console.log(`🚀  Server ready at ${port}`);
}

bootstrap();
