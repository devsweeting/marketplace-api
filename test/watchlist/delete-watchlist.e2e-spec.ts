import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';

import { createWatchlist, createWatchlistAsset } from '../utils/watchlist.utils';
import { Watchlist, WatchlistAsset } from 'modules/watchlists/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { createAsset } from '../utils/asset.utils';
import { Asset } from 'modules/assets/entities';
import { createPartner } from '../utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { v4 } from 'uuid';
import { generateNonce, generateOtpToken } from '../utils/jwt.utils';

describe('WatchlistController', () => {
  let app: INestApplication;
  let user: User;
  let partner: Partner;
  let asset: Asset;
  let watchlist: Watchlist;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ nonce: generateNonce() });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset(
      {
        refId: '1',
        name: 'Egg',
        description: 'test-egg',
      },
      partner,
    );
    watchlist = await createWatchlist({
      user: user,
    });
  });

  beforeEach(async () => {
    await WatchlistAsset.delete({});
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`DELETE V1 /watchlist`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).delete(`/v1/watchlist/${asset.id}`).send({}).expect(401);
    });

    test('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${asset.id}`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(401);
    });

    test('should throw 400 exception if assetId is not uuid', () => {
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/123`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: ['assetId must be a UUID'],
            statusCode: 400,
          });
        });
    });

    test('should throw 404 exception if media does not exist', () => {
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${v4()}`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(404);
    });

    test('should throw 404 exception if asset does not exist', async () => {
      await createWatchlistAsset({ assetId: asset.id, watchlistId: watchlist.id });
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${v4()}`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(404);
    });

    test('should throw 404 exception if watchlist does not exist', async () => {
      await createWatchlistAsset({ assetId: asset.id, watchlistId: watchlist.id });
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${v4()}`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(404);
    });

    test('should throw 409 exception if asset not added to watchlist', async () => {
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${asset.id}`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(409)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 409,
            error: 'Conflict',
            message: 'WATCHLIST_ASSET_NOT_ADDED',
          });
        });
    });

    test('should remove asset from the watchlist', async () => {
      await createWatchlistAsset({ assetId: asset.id, watchlistId: watchlist.id });
      return request(app.getHttpServer())
        .delete(`/v1/watchlist/${asset.id}`)
        .set({ Authorization: `Bearer ${generateOtpToken(user)}` })
        .send()
        .expect(200)
        .then(async () => {
          const persistedWatchlistAsset = await WatchlistAsset.findOne({
            where: { assetId: asset.id, watchlistId: watchlist.id, isDeleted: false },
          });
          expect(persistedWatchlistAsset).toBeUndefined();
        });
    });
  });
});
