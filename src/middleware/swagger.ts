import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { AssetResponse } from 'modules/assets/responses/asset.response';
import { INestApplication } from '@nestjs/common';
import { PortfolioResponse } from 'modules/portfolio/responses';
import { UserAssetResponse } from 'modules/users/responses';
import { SellOrderResponse } from 'modules/sell-orders/responses';

export const setupSwagger = (app: INestApplication): void => {
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
    .addBearerAuth(
      {
        name: 'Bearer',
        description: 'User Bearer Token header. Example: "Authorization: Bearer {token}".',
        type: 'http',
      },
      'bearer-token',
    )
    .setExternalDoc('Postman Collection', '/docs-json')
    .build();

  SwaggerModule.setup(
    '/docs',
    app,
    SwaggerModule.createDocument(app, options, {
      extraModels: [
        PaginatedResponse,
        AssetResponse,
        PortfolioResponse,
        UserAssetResponse,
        SellOrderResponse,
      ],
    }),
    uiOptions,
  );
};

const uiOptions: SwaggerCustomOptions = {
  customSiteTitle: 'Jump Api Swagger',
};
