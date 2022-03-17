import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute } from 'modules/assets/entities';
import { createAttribute } from '@/test/utils/attribute.utils';
import { v4 } from 'uuid';
import { createFile } from '@/test/utils/file.utils';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let attribute: Attribute;

  beforeAll(async () => {
    app = await createApp();
    partner = await createPartner({
      apiKey: 'test-api-key',
    });
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      image: await createFile(),
      slug: 'egg',
      description: 'test-egg',
      partner,
    });
    attribute = await createAttribute({
      asset,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`DELETE /assets/:id`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).delete(`/assets/${asset.id}`).send().expect(401);
    });

    it('should throw 401 exception if auth token is invalid', () => {
      return request(app.getHttpServer())
        .delete(`/assets/${asset.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send()
        .expect(401);
    });

    it('should throw 404 exception if id is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/assets/123`)
        .set({
          'x-api-key': partner.apiKey,
        })
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

    it('should throw 404 exception if asset does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/assets/${v4()}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(404);
    });

    it('should throw 404 exception if asset does not belong to the partner', async () => {
      const otherPartner = await createPartner({
        apiKey: 'other-test-api-key',
      });
      const otherAsset = await createAsset({ partner: otherPartner });

      return request(app.getHttpServer())
        .delete(`/assets/${otherAsset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(404);
    });

    it('should remove asset', async () => {
      return request(app.getHttpServer())
        .delete(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(200)
        .then(async () => {
          const persistedAsset = await Asset.findOne({
            where: { id: asset.id, isDeleted: false },
          });
          const persistedAttribute = await Attribute.findOne({
            where: { id: attribute.id, isDeleted: false },
          });
          expect(persistedAsset).toBeUndefined();
          expect(persistedAttribute).toBeUndefined();
        });
    });
  });
});
