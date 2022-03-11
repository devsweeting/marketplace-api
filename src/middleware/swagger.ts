import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = ({ app }) => {
  const options = new DocumentBuilder()
    .setTitle('Jump API')
    .setDescription('Jump.co API')
    .setVersion('1.0')
    .addApiKey(
      {
        name: 'x-api-key',
        in: 'header',
        description: 'API Key Authorization header. Example: "Authorization: x-api-key {key}".',
        type: 'apiKey',
      },
      'api-key',
    )
    .build();

  SwaggerModule.setup('/docs', app, SwaggerModule.createDocument(app, options));
};