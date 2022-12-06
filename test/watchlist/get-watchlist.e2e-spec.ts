import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { WatchlistTransformer } from 'modules/watchlists/transformers/watchlist.transformer';

import { createWatchlist, createWatchlistAsset } from '../utils/watchlist.utils';
import { Watchlist, WatchlistAsset } from 'modules/watchlists/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { createAsset } from '../utils/asset.utils';
import { Asset } from 'modules/assets/entities';
import { createPartner } from '../utils/partner.utils';
import { Partner } from 'modules/partners/entities';
import { generateNonce, generateToken } from '../utils/jwt.utils';

describe('WatchlistController', () => {
  let app: INestApplication;
  let user: User;
  let anotherUser: User;
  let partner: Partner;
  let assets: Asset[];
  let watchlists: Watchlist[];
  let watchlistTransformer: WatchlistTransformer;

  beforeAll(async () => {
    app = await createApp();
    watchlistTransformer = app.get(WatchlistTransformer);
    user = await createUser({ nonce: generateNonce() });
    anotherUser = await createUser({ nonce: generateNonce() });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    assets = [
      await createAsset(
        {
          refId: '1',
          name: 'Egg',
          description: 'test-egg',
          attributes: [
            {
              trait: 'category',
              value: 'baseball',
            },
          ],
        },
        partner,
      ),
      await createAsset(
        {
          refId: '2',
          name: 'Water',
          description: 'test-water',
        },
        partner,
      ),
    ];
    watchlists = [
      await createWatchlist({
        user: user,
      }),
      await createWatchlist({
        user: anotherUser,
      }),
    ];
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
    test('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/`)
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist/`)
        .set({ Authorization: `Bearer wrong` })
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    test('should empty list if second page is empty', async () => {
      const params = new URLSearchParams({
        page: '2',
      });

      await createWatchlistAsset({
        assetId: assets[0].id,
        watchlistId: watchlists[0].id,
      });
      await createWatchlistAsset({
        assetId: assets[1].id,
        watchlistId: watchlists[0].id,
      });

      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
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

    test('should return 1 element', async () => {
      const params = new URLSearchParams({
        limit: '1',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [Object.assign(watchlistAssets[1], { asset: assets[1] })];

      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should return 2 page', async () => {
      const params = new URLSearchParams({
        limit: '1',
        page: '2',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [Object.assign(watchlistAssets[0], { asset: assets[0] })];
      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 1,
              itemsPerPage: 1,
              totalPages: 2,
              currentPage: 2,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should return 2 per page', async () => {
      const params = new URLSearchParams({
        limit: '2',
      });
      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 2,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });
    test('should sort by createdAt ASC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.createdAt',
        order: 'ASC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
      ];

      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should sort by createdAt DESC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.createdAt',
        order: 'DESC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should sort by slug ASC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'ASC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
      ];

      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should sort by slug DESC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.slug',
        order: 'DESC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should sort by name ASC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'ASC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
      ];

      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should sort by name DESC', async () => {
      const params = new URLSearchParams({
        sort: 'asset.name',
        order: 'DESC',
      });

      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist?${params.toString()}`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should return watchlist assets', async () => {
      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should return watchlist assets with attributes', async () => {
      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[1].id,
          watchlistId: watchlists[0].id,
        }),
      ];
      const result = [
        Object.assign(watchlistAssets[1], { asset: assets[1] }),
        Object.assign(watchlistAssets[0], { asset: assets[0] }),
      ];
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 2,
              itemCount: 2,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('should return watchlist assets only for user owner', async () => {
      const watchlistAssets = [
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[0].id,
        }),
        await createWatchlistAsset({
          assetId: assets[0].id,
          watchlistId: watchlists[1].id,
        }),
      ];
      const result = [Object.assign(watchlistAssets[0], { asset: assets[0] })];
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            meta: {
              totalItems: 1,
              itemCount: 1,
              itemsPerPage: 25,
              totalPages: 1,
              currentPage: 1,
            },
            items: watchlistTransformer.transformAll(result),
          });
        });
    });

    test('return empty list if user has not added assets', () => {
      return request(app.getHttpServer())
        .get(`/v1/watchlist`)
        .set({ Authorization: `Bearer ${generateToken(user)}` })
        .send()
        .expect(HttpStatus.OK)
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
  });
});
