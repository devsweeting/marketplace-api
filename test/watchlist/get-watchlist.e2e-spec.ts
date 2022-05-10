import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { WatchlistTransformer } from 'modules/watchlists/transformers/watchlist.transformer';

import { createWatchlist, createWatchlistAsset } from '../utils/watchlist.utils';
import { Watchlist, WatchlistAsset } from 'modules/watchlists/entities';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/create-user';
import { createAsset } from '../utils/asset.utils';
import { Asset } from 'modules/assets/entities';
import { createPartner } from '../utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { generateNonce, generateToken } from '../utils/jwt.utils';

describe('WatchlistController', () => {
  let app: INestApplication;
  let user: User;
  let partner: Partner;
  let asset: Asset;
  let watchlist: Watchlist;
  let watchlistAssets: WatchlistAsset[];
  let watchlistTransformer: WatchlistTransformer;

  beforeAll(async () => {
    app = await createApp();
    watchlistTransformer = app.get(WatchlistTransformer);
    user = await createUser({ nonce: generateNonce() });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      description: 'test-egg',
      partner,
    });
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

  describe(`GET V1 /watchlist`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).get(`/v1/watchlist/`).send({}).expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(401);
    });

    it('should return watchlist assets ids', async () => {
      watchlistAssets = [
        await createWatchlistAsset({
          assetId: asset.id,
          watchlistId: watchlist.id,
        }),
      ];
      const response = Object.assign(watchlist, { watchlistAssets });
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(watchlistTransformer.transform(response));
        });
    });

    it('return empty list if user has not added assets', () => {
      const response = Object.assign(watchlist, { watchlistAssets: [] });
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(watchlistTransformer.transform(response));
        });
    });

    it('return empty list if user has not added assets', async () => {
      await Watchlist.delete({});

      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assets: [] });
        });
    });
  });
});
