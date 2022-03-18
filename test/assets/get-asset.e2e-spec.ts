import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { Asset } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { createFile } from '@/test/utils/file.utils';
import { v4 } from 'uuid';

describe('AssetsController', () => {
  let app: INestApplication;
  let asset: Asset;
  let assetsTransformer: AssetsTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      image: await createFile(),
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

  describe(`GET /assets/:id`, () => {
    it('should return asset', () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);

      return request(app.getHttpServer())
        .get(`/assets/${asset.id}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(assetsTransformer.transform(asset));
        })
        .then(() => {
          expect(mockS3Provider.getUrl).toHaveBeenCalledWith(asset.image);
        });
    });

    it('should 400 exception id is invalid', () => {
      return request(app.getHttpServer())
        .get(`/assets/123`)
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

    it('should 404 exception if file does not exist', () => {
      return request(app.getHttpServer())
        .get(`/assets/${v4()}`)
        .send()
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'ASSET_NOT_FOUND',
            statusCode: 404,
          });
        });
    });
  });
});
