import { createApp } from './utils/app.utils';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('AppController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  it('should redirect to url', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect(({ redirect, header }) => {
        expect(redirect).toBeTruthy();
        expect(header.location).toContain(`${process.env.REDIRECT_ROOT_URL}`);
      });
  });
});
