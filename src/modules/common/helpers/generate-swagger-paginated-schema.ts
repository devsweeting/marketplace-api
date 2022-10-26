import { getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';

export const generateSwaggerPaginatedSchema = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  model: string | Function,
): {
  allOf: (
    | { $ref: string }
    | { properties: { items: { type: string; items: { $ref: string } } } }
  )[];
} => ({
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
