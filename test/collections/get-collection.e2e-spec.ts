import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { CollectionsTransformer } from 'modules/collections/transformers/collections.transformer';
import { createFile } from '@/test/utils/file.utils';
import { v4 } from 'uuid';

import { createCollection } from '../utils/collection.utils';
import { Collection } from 'modules/collections/entities';

describe('CollectionsController', () => {
  let app: INestApplication;
  let collection: Collection;
  let collectionsTransformer: CollectionsTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    collectionsTransformer = app.get(CollectionsTransformer);

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

  describe(`GET V1 /collections/:id`, () => {
    it('should return collection', () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);

      return request(app.getHttpServer())
        .get(`/v1/collections/${collection.id}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(collectionsTransformer.transform(collection));
        })
        .then(() => {
          expect(mockS3Provider.getUrl).toHaveBeenCalledWith(collection.banner);
        });
    });

    it('should 404 exception id is invalid', () => {
      return request(app.getHttpServer())
        .get(`/v1/collections/123`)
        .send()
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'COLLECTION_NOT_FOUND',
            statusCode: 404,
          });
        });
    });

    it('should 404 exception if collection does not exist', () => {
      return request(app.getHttpServer())
        .get(`/v1/collections/${v4()}`)
        .send()
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'COLLECTION_NOT_FOUND',
            statusCode: 404,
          });
        });
    });
  });
});
