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
import { generateNonce, generateToken } from '../utils/jwt.utils';

describe('WatchlistController', () => {
  let app: INestApplication;
  let user: User;
  let partner: Partner;
  let asset: Asset;
  let watchlist: Watchlist;
  let watchlistAsset: WatchlistAsset;

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
  });

  beforeEach(async () => {
    await WatchlistAsset.delete({});
    await Watchlist.delete({});
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /watchlist`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).post(`/v1/watchlist`).send({}).expect(401);
    });

    test('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .post(`/v1/watchlist`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(401);
    });

    test('should add new asset to watchlist if watchlist does not exists', async () => {
      const dtoRequest = { assetId: asset.id };
      return request(app.getHttpServer())
        .post(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send(dtoRequest)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toEqual({ status: 201, description: 'Asset was added to watchlist' });
        })
        .then(async () => {
          const watchlist = await Watchlist.findOne({
            where: { userId: user.id },
            relations: ['watchlistAssets'],
          });
          expect(watchlist).toBeDefined();
          expect(watchlist.watchlistAssets).toBeDefined();
          expect(watchlist.watchlistAssets[0].assetId).toEqual(asset.id);
        });
    });
  });
  test('should add new asset to watchlist if watchlist exists', async () => {
    const dtoRequest = { assetId: asset.id };
    watchlist = await createWatchlist({
      user: user,
    });
    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ status: 201, description: 'Asset was added to watchlist' });
      });
  });
  test('should add new asset to watchlist if watchlist exists with another asset', async () => {
    const newAsset = await createAsset(
      {
        refId: '2',
        name: 'New',
        description: 'test-egg',
      },
      partner,
    );
    const dtoRequest = { assetId: newAsset.id };
    watchlist = await createWatchlist({
      user: user,
    });

    await createWatchlistAsset({
      assetId: asset.id,
      watchlistId: watchlist.id,
    });

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ status: 201, description: 'Asset was added to watchlist' });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeDefined();
        expect(watchlist.watchlistAssets).toBeDefined();
        expect(watchlist.watchlistAssets.length).toEqual(2);
        expect(watchlist.watchlistAssets[0].assetId).toEqual(asset.id);
        expect(watchlist.watchlistAssets[1].assetId).toEqual(newAsset.id);
      });
  });
  test('should re-add asset to watchlist', async () => {
    const dtoRequest = { assetId: asset.id };
    watchlist = await createWatchlist({
      user: user,
    });

    watchlistAsset = await createWatchlistAsset({
      assetId: asset.id,
      watchlistId: watchlist.id,
      isDeleted: true,
      deletedAt: new Date(),
    });

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({ status: 201, description: 'Asset was added to watchlist' });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeDefined();
        expect(watchlist.watchlistAssets).toBeDefined();
        expect(watchlist.watchlistAssets.length).toEqual(1);
        expect(watchlist.watchlistAssets[0].assetId).toEqual(asset.id);
        expect(watchlist.watchlistAssets[0].isDeleted).toEqual(false);
        expect(watchlist.watchlistAssets[0].deletedAt).toEqual(null);
        expect(watchlist.watchlistAssets[0].updatedAt).not.toEqual(watchlistAsset.updatedAt);
      });
  });

  test('throw duplicate exception if asset already exists in watchlist for user', async () => {
    const dtoRequest = { assetId: asset.id };
    watchlist = await createWatchlist({
      user: user,
    });

    await createWatchlistAsset({
      assetId: asset.id,
      watchlistId: watchlist.id,
    });

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(409)
      .expect(({ body }) => {
        expect(body).toEqual({
          statusCode: 409,
          error: 'Conflict',
          message: 'WATCHLIST_ASSET_DUPLICATED',
        });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeDefined();
        expect(watchlist.watchlistAssets).toBeDefined();
        expect(watchlist.watchlistAssets.length).toEqual(1);
        expect(watchlist.watchlistAssets[0].assetId).toEqual(asset.id);
      });
  });
  test('throw asset not found exception if asset does not exists and watchlist also does not exists', async () => {
    const dtoRequest = { assetId: v4() };

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(404)
      .expect(({ body }) => {
        expect(body).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'ASSET_NOT_FOUND',
        });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeNull();
      });
  });
  test('throw asset not found exception if asset does not exists', async () => {
    const dtoRequest = { assetId: v4() };
    watchlist = await createWatchlist({
      user: user,
    });

    await createWatchlistAsset({
      assetId: asset.id,
      watchlistId: watchlist.id,
    });

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(404)
      .expect(({ body }) => {
        expect(body).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'ASSET_NOT_FOUND',
        });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeDefined();
        expect(watchlist.watchlistAssets).toBeDefined();
        expect(watchlist.watchlistAssets.length).toEqual(1);
        expect(watchlist.watchlistAssets[0].assetId).toEqual(asset.id);
      });
  });
  test('throw exception if over limit watchlist allowed number of assets ', async () => {
    const dtoRequest = { assetId: asset.id };
    watchlist = await createWatchlist({
      user: user,
    });

    for (let index = 3; index < 8; index++) {
      asset = await createAsset(
        {
          refId: `${index}`,
          name: `Egg ${index}`,
          description: 'test-egg',
        },
        partner,
      );
      await createWatchlistAsset({
        assetId: asset.id,
        watchlistId: watchlist.id,
      });
    }

    return request(app.getHttpServer())
      .post(`/v1/watchlist`)
      .set({ Authorization: `Bearer ${generateToken(user)}` })
      .send(dtoRequest)
      .expect(409)
      .expect(({ body }) => {
        expect(body).toEqual({
          statusCode: 409,
          error: 'Conflict',
          message: 'WATCHLIST_MAX_ASSET_OVER_LIMIT',
        });
      })
      .then(async () => {
        const watchlist = await Watchlist.findOne({
          where: { userId: user.id },
          relations: ['watchlistAssets'],
        });
        expect(watchlist).toBeDefined();
        expect(watchlist.watchlistAssets).toBeDefined();
        expect(watchlist.watchlistAssets.length).toEqual(5);
      });
  });
});
