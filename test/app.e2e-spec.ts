import { createApp } from './utils/app.utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('AppController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  test('should redirect to url', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.MOVED_PERMANENTLY)
      .expect(({ redirect, header }) => {
        expect(redirect).toBeTruthy();
        expect(header.location).toContain(`${process.env.FRONTEND_URL}`);
      });
  });
});
