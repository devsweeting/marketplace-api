import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';

import { createWatchlist, createWatchlistAsset } from '../utils/watchlist.utils';
import { Watchlist } from 'modules/watchlists/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { createAsset } from '../utils/asset.utils';
import { Asset } from 'modules/assets/entities';
import { createPartner } from '../utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { generateNonce, generateOtpToken } from '../utils/jwt.utils';
import { v4 } from 'uuid';

describe('WatchlistController', () => {
  let app: INestApplication;
  let users: User[];
  let partners: Partner[];
  let assets: Asset[];
  let watchlist: Watchlist;

  beforeAll(async () => {
    app = await createApp();
    users = [
      await createUser({ nonce: generateNonce() }),
      await createUser({ nonce: generateNonce() }),
    ];
    partners = [
      await createPartner({
        apiKey: 'test-api-key',
        accountOwner: users[0],
      }),
      await createPartner({
        apiKey: 'test-api-key',
        accountOwner: users[1],
      }),
    ];
    assets = [
      await createAsset(
        {
          refId: '1',
          name: 'Egg',
          description: 'test-egg',
        },
        partners[0],
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Water',
          description: 'test-water',
        },
        partners[1],
      ),
    ];
    watchlist = await createWatchlist({
      user: users[0],
    });

    await createWatchlistAsset({ watchlistId: watchlist.id, assetId: assets[0].id });
    await createWatchlistAsset({ watchlistId: watchlist.id, assetId: assets[1].id });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET V1 /watchlist`, () => {
    test('should throw 401 exception if asset does not exist and auth token is missing', () => {
      return request(app.getHttpServer()).get(`/v1/watchlist/check/${v4()}`).send().expect(401);
    });

    test('should throw 401 exception if auth token is missing for id', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].id}`)
        .send({})
        .expect(401);
    });

    test('should throw 401 exception if auth token is missing for slug', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].slug}`)
        .send({})
        .expect(401);
    });

    test('should throw 401 exception if token is invalid for id', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].id}`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(401);
    });

    test('should throw 401 exception if token is invalid for slug', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].slug}`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(401);
    });

    test('return inWatchlist: false if user has not added asset to watchlist for id', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[1].id}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[1])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: assets[1].id, inWatchlist: false });
        });
    });

    test('return inWatchlist: false if user has not added asset to watchlist for slug', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[1].slug}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[1])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: assets[1].id, inWatchlist: false });
        });
    });

    test('return inWatchlist: true if user has added asset to watchlist for id', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].id}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: assets[0].id, inWatchlist: true });
        });
    });

    test('return inWatchlist: true if user has added asset to watchlist for slug', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${assets[0].slug}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: assets[0].id, inWatchlist: true });
        });
    });

    test('return inWatchlist: true if user has added asset to watchlist but asset is deleted: search by id', async () => {
      const asset = await createAsset(
        {
          refId: '3',
          name: 'Water',
          description: 'test-water',
          isDeleted: true,
          deletedAt: new Date(),
        },
        partners[0],
      );

      await createWatchlistAsset({ watchlistId: watchlist.id, assetId: asset.id });

      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${asset.slug}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: asset.id, inWatchlist: true });
        });
    });

    test('return inWatchlist: true if user has added asset to watchlist but asset is deleted: search by slug', async () => {
      const asset = await createAsset(
        {
          refId: '4',
          name: 'Water',
          description: 'test-water',
          isDeleted: true,
          deletedAt: new Date(),
        },
        partners[0],
      );

      await createWatchlistAsset({ watchlistId: watchlist.id, assetId: asset.id });

      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${asset.slug}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({ assetId: asset.id, inWatchlist: true });
        });
    });

    test('return 404 if asset does not exist for wrong id ', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/${v4()}`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(404);
    });

    test('return 404 if asset does not exist for wrong slug ', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/check/wrong-slug`)
        .set({ Authorization: `Bearer ${generateOtpToken(users[0])}` })
        .send()
        .expect(404);
    });
  });
});
