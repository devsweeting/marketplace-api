import { createApp } from './utils/app.utils';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { quotes } from '@/src/app.service';

describe('AppController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  it('should return a random quote', () =>
    request(app.getHttpServer())
      .get('/')
      .set({
        'x-api-key': 'somekey',
      })
      .expect(200)
      .expect(({ text }) => {
        expect(quotes).toContain(text);
      }));
});
