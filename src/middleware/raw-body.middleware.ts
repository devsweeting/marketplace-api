import { Response } from 'express';
import { json } from 'body-parser';
import RequestWithRawBody from './request-with-raw-body.interface';

function rawBodyMiddleware() {
  const rawEndpoints = ['/subscriptions/webhook'];

  return json({
    verify: (
      request: RequestWithRawBody,
      response: Response,
      buffer: Buffer,
    ) => {
      if (rawEndpoints.includes(request.url) && Buffer.isBuffer(buffer)) {
        request.rawBody = Buffer.from(buffer);
      }

      return true;
    },
  });
}

export default rawBodyMiddleware;
