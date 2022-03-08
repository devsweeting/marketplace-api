import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@/test/utils/app.utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TEST_API_KEY = 'd2e621a6646a4211768cd68e26f21228a81';
const TEST_API_PARTNER_ID = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';

describe('PartnersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createApp();
  });

  describe(`POST /partners/${TEST_API_PARTNER_ID}/assets`, () => {
    it('should create a new asset transfer object in the db', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
            listing: {
              marketplace: 'OpenSea',
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(transferRequest)
        .expect(201);
    });

    it('should throw an exception if assets property is undefined', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets should not be null or undefined',
            'assets must contain at least 1 elements',
          ],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if assets property is empty', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['assets must contain at least 1 elements'],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if asset object is invalid', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: 'a'.repeat(105),
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .set({
          'x-api-key': 'somekey',
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.refId must be shorter than or equal to 100 characters',
            'assets.0.listing should not be empty',
            'assets.0.image must be shorter than or equal to 255 characters',
            'assets.0.image should not be empty',
            'assets.0.name must be shorter than or equal to 50 characters',
            'assets.0.name should not be empty',
            'assets.0.description should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
