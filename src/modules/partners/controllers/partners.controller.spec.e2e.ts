import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestUtils } from '../../test/test.utils';
const TEST_API_KEY = 'd2e621a6646a4211768cd68e26f21228a81';
const TEST_API_PARTNER_ID = '1D700038-58B1-4EF0-8737-4DB7D6A9D60F';

describe('PartnersController', () => {
  let app: INestApplication;
  let testUtils: TestUtils;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      // imports: [DatabaseModule],
      // providers: [DatabaseService, TestUtils],
    }).compile();
    testUtils = module.get<TestUtils>(TestUtils);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    // await testUtils.closeDbConnection();
    await app.close();
  });

  describe(`/POST /partners/${TEST_API_PARTNER_ID}/assets`, () => {
    it('Should create a new asset transfer object in the db', () => {
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
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .send(transferRequest)
        .expect(201);
    });

    it('Should require assets section', () => {
      const transferRequest: any = {
        user: {
          email: 'steven@example.com',
        },
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
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

    it('With assets containing an refId field', () => {
      const transferRequest: any = {
        user: {
          email: 'steven@example.com',
        },
        assets: [
          {
            name: 'Example',
            image: 'https://example.com/image.png',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.refId must be shorter than or equal to 100 characters',
            'assets.0.refId should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('With assets containing an image field', () => {
      const transferRequest: any = {
        user: {
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.image must be shorter than or equal to 255 characters',
            'assets.0.image should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('With assets containing name field', () => {
      const transferRequest: any = {
        user: {
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.name must be shorter than or equal to 50 characters',
            'assets.0.name should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('Should fail without user email', () => {
      const transferRequest: any = {
        user: {},
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/${TEST_API_PARTNER_ID}/assets`)
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['user.email should not be empty'],
          error: 'Bad Request',
        });
    });
  });
});
