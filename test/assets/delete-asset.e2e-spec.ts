import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute } from 'modules/assets/entities';
import { createAttribute } from '@/test/utils/attribute.utils';
import { v4 } from 'uuid';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createImageMedia } from '../utils/media.utils';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let attribute: Attribute;
  let user: User;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      slug: 'egg',
      description: 'test-egg',
      partner,
    });
    attribute = await createAttribute({
      asset,
    });
    await createImageMedia({ assetId: asset.id });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`DELETE V1 /assets/:id`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).delete(`/v1/assets/${asset.id}`).send().expect(401);
    });

    test('should throw 401 exception if auth token is invalid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send()
        .expect(401);
    });

    test('should throw 404 exception if id is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/assets/123`)
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

    test('should throw 404 exception if asset does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/v1/assets/${v4()}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(404);
    });

    test('should throw 404 exception if asset does not belong to the partner', async () => {
      const anotherUser = await createUser({});
      const otherPartner = await createPartner({
        apiKey: 'other-test-api-key',
        accountOwner: anotherUser,
      });
      const otherAsset = await createAsset({ partner: otherPartner });

      return request(app.getHttpServer())
        .delete(`/v1/assets/${otherAsset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(404);
    });

    test('should remove asset', async () => {
      return request(app.getHttpServer())
        .delete(`/v1/assets/${asset.id}`)
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
