import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './addons/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // We may decide to make the swagger documentation public ast some point,
  // but for now it's going to only be available in development mode.
  if (process.env.NODE_ENV === 'DEVELOP' || process.env.NODE_ENV === 'TEST') {
    setupSwagger({ app });
  }

  const configService = app.get(ConfigService);
  const serverConfig = configService.get('server').default;
  const port = serverConfig.port;

  await app.listen(port);

  // tslint:disable-next-line: no-console
  console.log(`🚀  Server ready at ${port}`);
}

bootstrap();
