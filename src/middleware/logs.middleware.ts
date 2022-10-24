import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { format } from 'date-fns';
import IRequestWithUser from 'modules/auth/interfaces/request-with-user.interface';
import { StatusCodes } from 'http-status-codes';

@Injectable()
class LogsMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: IRequestWithUser, response: Response, next: NextFunction): void {
    response.on('finish', () => {
      const { method, originalUrl, ip } = request;
      const { statusCode, statusMessage } = response;
      const userId: string = request.user?.id || '-';
      const contentLength = response.get('content-length') || '';
      const date = format(new Date(), 'd/MM/Y:H:mm:ss z');
      const message = `${ip} ${userId} [${date}] "${method} ${originalUrl}" ${statusCode} ${statusMessage} ${contentLength}`;

      if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
        return this.logger.error(message);
      }

      if (statusCode >= StatusCodes.BAD_REQUEST) {
        return this.logger.warn(message);
      }

      return this.logger.log(message);
    });

    next();
  }
}

export default LogsMiddleware;
