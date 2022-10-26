import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { v4 } from 'uuid';
import { createFile } from '@/test/utils/file.utils';
import { createCollection } from '../utils/collection.utils';
import { Collection } from 'modules/collections/entities';
import { StatusCodes } from 'http-status-codes';

describe('CollectionsController', () => {
  let app: INestApplication;
  let collection;

  beforeAll(async () => {
    app = await createApp();
    collection = await createCollection({
      name: 'Egg',
      banner: await createFile(),
      slug: 'egg',
      description: 'test-egg',
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`DELETE V1 /collections/:id`, () => {
    test('should throw 400 exception if id is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/collections/123`)
        .send()
        .expect(StatusCodes.BAD_REQUEST)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: ['id must be a UUID'],
            statusCode: StatusCodes.BAD_REQUEST,
          });
        });
    });

    test('should throw 404 exception if collection does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/v1/collections/${v4()}`)
        .send()
        .expect(StatusCodes.NOT_FOUND);
    });

    test('should remove collection', async () => {
      return request(app.getHttpServer())
        .delete(`/v1/collections/${collection.id}`)
        .send()
        .expect(StatusCodes.OK)
        .then(async () => {
          const persistedCollection = await Collection.findOne({
            where: { id: collection.id, isDeleted: false },
          });
          expect(persistedCollection).toBeNull();
        });
    });
  });
});
