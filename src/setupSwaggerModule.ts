import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwaggerModule = ({ app }) => {
  const options = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('Marketplace Backend API')
    .setVersion('1.0')
    .addTag('marketplace')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('/docs', app, SwaggerModule.createDocument(app, options));
};
