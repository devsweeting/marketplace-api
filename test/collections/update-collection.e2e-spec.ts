import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';

import { v4 } from 'uuid';

import { generateSlug } from 'modules/common/helpers/slug.helper';

import { CollectionsTransformer } from 'modules/collections/transformers/collections.transformer';
import { createCollection } from '../utils/collection.utils';
import { Collection } from 'modules/collections/entities';
import { createFile } from '../utils/file.utils';

describe('CollectionsController', () => {
  let app: INestApplication;
  let collection: Collection;
  let collectionsTransformer: CollectionsTransformer;

  beforeAll(async () => {
    app = await createApp();
    collectionsTransformer = app.get(CollectionsTransformer);
  });

  beforeEach(async () => {
    collection = await createCollection({
      name: 'Egg',
      banner: await createFile({}),
      slug: 'egg',
      description: 'test-egg',
    });
  });

  afterEach(async () => {
    await Collection.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH V1 /collections/:id`, () => {
    test('should throw 404 exception if collection does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/v1/collections/${v4()}`)
        .send({})
        .expect(HttpStatus.NOT_FOUND);
    });

    test('should update banner', async () => {
      const payload = {
        banner: 'https://cdn.pixabay.com/photo/2012/04/11/17/53/approved-29149_960_720.png',
      };

      return request(app.getHttpServer())
        .patch(`/v1/collections/${collection.id}`)
        .send(payload)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...collectionsTransformer.transform(collection),
            banner: expect.any(String),
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          const updatedCollection = await Collection.findOne({
            where: { id: collection.id },
            relations: ['banner'],
          });
          expect(updatedCollection.banner).toBeDefined();
        });
    });

    test('should update name', async () => {
      const payload = {
        name: 'Test name 2',
      };

      return request(app.getHttpServer())
        .patch(`/v1/collections/${collection.id}`)

        .send(payload)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...collectionsTransformer.transform(collection),
            name: payload.name,
            slug: generateSlug(payload.name),
            updatedAt: expect.any(String),
            banner: expect.any(String),
          });
        })
        .then(async () => {
          await collection.reload();
          expect(collection.name).toEqual(payload.name);
          expect(collection.slug).toEqual(generateSlug(payload.name));
        });
    });

    test('should update description', async () => {
      const payload = {
        description: 'some new description',
      };

      return request(app.getHttpServer())
        .patch(`/v1/collections/${collection.id}`)
        .send(payload)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...collectionsTransformer.transform(collection),
            description: payload.description,
            updatedAt: expect.any(String),
            banner: expect.any(String),
          });
        })
        .then(async () => {
          await collection.reload();
          expect(collection.description).toEqual(payload.description);
        });
    });
  });
});
