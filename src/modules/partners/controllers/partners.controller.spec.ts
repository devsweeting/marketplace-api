import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PartnersModule } from '..';

describe('PartnersController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PartnersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  describe('/POST assets', () => {
    it('Should create a new asset transfer object in the db', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            image: 'https://example.com/image.png',
            name: 'Example',
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/partners/assets')
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
        .post('/partners/assets')
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

    it('Should fail without user email', () => {
      const transferRequest: any = {
        user: {},
        assets: [
          {
            image: 'https://example.com/image.png',
            name: 'Example',
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/partners/assets')
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['user.email should not be empty'],
          error: 'Bad Request',
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
