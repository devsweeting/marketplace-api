import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { createFile } from '@/test/utils/file.utils';

describe('AssetsController', () => {
  let app: INestApplication;
  let assets: Asset[];
  let assetsTransformer: AssetsTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    assets = [
      await createAsset({
        refId: '1',
        name: 'Egg',
        image: await createFile(),
        slug: 'egg',
        description: 'test-egg',
      }),
      await createAsset({
        refId: '2',
        name: 'Pumpkin',
        image: await createFile(),
        slug: 'pumpkin',
        description: 'test-pumpkin',
      }),
    ];
    mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET /assets`, () => {
    it('should return 1 element', () => {
      const params = new URLSearchParams({
        limit: '1',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should return 2 page', () => {
      const params = new URLSearchParams({
        limit: '1',
        page: '2',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 2,
            },
            items: [assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should return 2 per page', () => {
      const params = new URLSearchParams({
        limit: '2',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 2,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should sort by name ASC', () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'ASC',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should sort by name DESC', () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'DESC',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should sort by slug ASC', () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'ASC',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[0]), assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should sort by slug DESC', () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'DESC',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1]), assetsTransformer.transform(assets[0])],
          });
        });
    });

    it('should search by name', () => {
      const params = new URLSearchParams({
        query: 'pumpkin',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: [assetsTransformer.transform(assets[1])],
          });
        });
    });

    it('should empty list if there is no results', () => {
      const params = new URLSearchParams({
        query: 'carrot',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 0,
              currentPage: 1,
            },
            items: [],
          });
        });
    });

    it('should empty list if second page is empty', () => {
      const params = new URLSearchParams({
        page: '2',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 0,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 2,
            },
            items: [],
          });
        });
    });

    it('should 400 exception if params are invalid', () => {
      const params = new URLSearchParams({
        page: '-4',
        limit: '-10',
        sort: 'sausage',
        order: 'NULL',
      });

      return request(app.getHttpServer())
        .get(`/assets?${params.toString()}`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: [
              'sort must be a valid enum value',
              'page must not be less than 1',
              'limit must not be less than 0',
              'order must be a valid enum value',
            ],
            statusCode: 400,
          });
        });
    });
  });
});
