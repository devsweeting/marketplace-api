import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';

import { Collection } from 'modules/collections/entities';
import { CollectionDto } from 'modules/collections/dto';

describe('CollectionController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Collection.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /collections`, () => {
    test('should create a new collection object in the db', () => {
      const collectionDto: CollectionDto = {
        name: 'test',
        description: 'description',
        banner:
          'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
      };

      return request(app.getHttpServer())
        .post(`/v1/collections`)
        .send(collectionDto)
        .expect(201)
        .then(async () => {
          const collection = await Collection.findOne({
            where: { slug: collectionDto.name },
            relations: ['banner'],
          });
          expect(collection).toBeDefined();
          expect(collection.name).toEqual(collectionDto.name);
          expect(collection.banner).toBeDefined();
          expect(collection.banner.path).toEqual(
            'collections/' + collection.id + '/' + collection.banner.name,
          );
          expect(collection.description).toEqual(collectionDto.description);
        });
    });

    test('should throw an exception if assets property is empty', () => {
      const collectionDto: any = {};

      return request(app.getHttpServer())
        .post(`/v1/collections`)
        .send(collectionDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'name must be shorter than or equal to 200 characters',
            'name should not be empty',
            'description should not be empty',
            'banner must be shorter than or equal to 255 characters',
            'banner should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    test('should throw an exception if asset object is invalid', () => {
      const collectionDto: CollectionDto = {
        name: '',
        description: '',
        banner: '',
      };

      return request(app.getHttpServer())
        .post(`/v1/collections`)
        .send(collectionDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'name should not be empty',
            'description should not be empty',
            'banner should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});
