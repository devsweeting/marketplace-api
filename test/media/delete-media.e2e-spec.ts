import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { v4 } from 'uuid';

import { createImageMedia } from '../utils/media.utils';
import { Asset, Media } from 'modules/assets/entities';
import { Partner } from 'modules/partners/entities';
import { createAsset } from '../utils/asset.utils';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';

describe('MediaController', () => {
  let app: INestApplication;
  let media: Media;
  let asset: Asset;
  let user: User;
  let partner: Partner;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({ partner });
  });

  beforeEach(async () => {
    media = await createImageMedia({
      assetId: asset.id,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`DELETE V1 /media/:id`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).delete(`/v1/media/${media.id}`).send().expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/media/${media.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send()
        .expect(401);
    });

    it('should throw 400 exception if id is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/media/123`)
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

    it('should throw 404 exception if media does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/v1/media/${v4()}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(404);
    });

    it('should throw 404 exception if partner is not owner', async () => {
      const dtoRequest = { title: 'title' };
      const anotherUser = await createUser({});
      const notOwnerPartner = await createPartner({
        apiKey: 'not-owner-partner-api-key',
        accountOwner: anotherUser,
      });

      return request(app.getHttpServer())
        .delete(`/v1/media/${media.id}`)
        .set({
          'x-api-key': notOwnerPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(404);
    });

    it('should remove media', async () => {
      return request(app.getHttpServer())
        .delete(`/v1/media/${media.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send()
        .expect(200)
        .then(async () => {
          const persistedMedia = await Media.findOne({
            where: { id: media.id, isDeleted: false },
          });
          expect(persistedMedia).toBeUndefined();
        });
    });
  });
});
