import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './middleware/swagger';
import { HttpExceptionFilter } from './exception.filter';
import validationPipe from 'modules/common/pipes/validation.pipe';
import { SanitizePipe } from 'modules/common/pipes/sanitize.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalPipes(validationPipe);

  // We may decide to make the swagger documentation public at some point,
  // but for now it's going to only be available in development mode.
  if (process.env.NODE_ENV === 'DEVELOP' || process.env.NODE_ENV === 'TEST') {
    setupSwagger({ app });
  }

  const configService = app.get(ConfigService);
  const serverConfig = configService.get('server').default;
  const port = serverConfig.port;
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);

  // tslint:disable-next-line: no-console
  console.log(`🚀  Server ready at ${port}`);
}

bootstrap();
