import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawBody = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Record<string, string[]> => {
    const request = ctx.switchToHttp().getRequest();
    return request.body;
  },
);
