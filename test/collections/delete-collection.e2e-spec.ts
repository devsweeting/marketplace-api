import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { v4 } from 'uuid';
import { createFile } from '@/test/utils/file.utils';
import { createCollection } from '../utils/collection.utils';
import { Collection } from 'modules/collections/entities';

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

  describe(`DELETE /collections/:id`, () => {
    it('should throw 400 exception if id is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/collections/123`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: ['id must be a UUID'],
            statusCode: 400,
          });
        });
    });

    it('should throw 404 exception if collection does not exist', () => {
      return request(app.getHttpServer()).delete(`/collections/${v4()}`).send().expect(404);
    });

    it('should remove collection', async () => {
      return request(app.getHttpServer())
        .delete(`/collections/${collection.id}`)
        .send()
        .expect(200)
        .then(async () => {
          const persistedCollection = await Collection.findOne({
            where: { id: collection.id, isDeleted: false },
          });
          expect(persistedCollection).toBeUndefined();
        });
    });
  });
});
