import './tracing';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './middleware/swagger';
import { HttpExceptionFilter } from './exception.filter';
import validationPipe from 'modules/common/pipes/validation.pipe';
import { SanitizePipe } from 'modules/common/pipes/sanitize.pipe';
import path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import setUpAdminJS from 'modules/admin/admin.config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new SanitizePipe());
  app.useGlobalPipes(validationPipe);
  app.useLogger(app.get(Logger));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  // We may decide to make the swagger documentation public at some point,
  // but for now it's going to only be available in development mode.
  if (process.env.NODE_ENV === 'DEVELOP' || process.env.NODE_ENV === 'TEST') {
    setupSwagger(app);
  }

  if (process.env.NODE_ENV == 'DEVELOP' || process.env.NODE_ENV == 'ADMIN') {
    await setUpAdminJS(app);
  }

  const port = configService.get('server.default.port');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setViewEngine('hbs');
  app.setBaseViewsDir(path.join(__dirname, 'modules', 'admin', 'views'));

  await app.listen(port);

  // tslint:disable-next-line: no-console
  console.log(`🚀  Server ready at ${port}`);
}

bootstrap();
