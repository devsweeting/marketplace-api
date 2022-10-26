import { createApp } from './utils/app.utils';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';

describe('AppController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  test('should redirect to url', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(StatusCodes.MOVED_TEMPORARILY)
      .expect(({ redirect, header }) => {
        expect(redirect).toBeTruthy();
        expect(header.location).toContain(`${process.env.FRONTEND_URL}`);
      });
  });
});
