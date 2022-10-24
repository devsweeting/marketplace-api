import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { RollbarLogger } from 'nestjs-rollbar';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request: any = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // eslint-disable-next-line no-console
    console.log('Exception', exception);
    if (process.env.NODE_ENV === 'STAGING' || process.env.NODE_ENV === 'PRODUCTION') {
      const rollbarLogger = new RollbarLogger({
        accessToken: process.env.ROLLBAR_TOKEN,
        environment: process.env.ROLLBAR_ENVIRONMENT,
        captureUncaught: true,
        captureUnhandledRejections: true,
        captureEmail: true,
        captureUsername: true,
      });

      if (request.user) {
        rollbarLogger.configure({
          payload: {
            person: {
              id: request.user.id,
              username: request.user.name,
            },
          },
        });
      }
      rollbarLogger.error(exception, `${request.method} ${request.url}`);
    }
    Logger.error(`${request.method} ${request.url}`, exception.getResponse(), 'ExceptionFilter');
    response.status(status).json(exception.getResponse());
  }
}
