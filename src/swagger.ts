import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = ({ app }) => {
  const options = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('Fractionalist Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('/docs', app, SwaggerModule.createDocument(app, options));
};
