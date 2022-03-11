import { getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

// eslint-disable-next-line @typescript-eslint/ban-types
export const generateSwaggerPaginatedSchema = (model: string | Function) => ({
  allOf: [
    { $ref: getSchemaPath(PaginatedResponse) },
    {
      properties: {
        items: {
          type: 'array',
          items: { $ref: getSchemaPath(model) },
        },
      },
    },
  ],
});
