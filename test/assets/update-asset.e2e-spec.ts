import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute } from 'modules/assets/entities';
import { v4 } from 'uuid';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { createAttribute } from '@/test/utils/attribute.utils';
import { MarketplaceEnum } from 'modules/assets/enums/marketplace.enum';
import { AuctionTypeEnum } from 'modules/assets/enums/auction-type.enum';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let asset: Asset;
  let assetTransformer: AssetsTransformer;

  beforeAll(async () => {
    app = await createApp();
    partner = await createPartner({
      apiKey: 'test-api-key',
    });
    asset = await createAsset({ partner });
    assetTransformer = app.get(AssetsTransformer);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH /assets/:id`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).patch(`/assets/${asset.id}`).send({}).expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send({})
        .expect(401);
    });

    it('should throw 404 exception if asset does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/assets/${v4()}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send({})
        .expect(404);
    });

    it('should throw 404 exception if assets belongs to another partner', async () => {
      const anotherPartner = await createPartner({
        apiKey: 'another-api-key',
      });
      const anotherAsset = await createAsset({ partner: anotherPartner });

      return request(app.getHttpServer())
        .patch(`/assets/${anotherAsset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send({})
        .expect(404);
    });

    it('should update refId', async () => {
      const payload = {
        refId: '12345',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            refId: payload.refId,
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.refId).toEqual(payload.refId);
        });
    });

    it('should pass if refId is the same', async () => {
      const payload = {
        refId: asset.refId,
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
          });
        });
    });

    it('should throw 409 exception if refId is already taken', async () => {
      await createAsset({
        refId: '123456',
        partner,
      });
      const payload = {
        refId: '123456',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(409)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Conflict',
            message: 'REF_ALREADY_TAKEN',
            statusCode: 409,
          });
        });
    });

    it('should update image', async () => {
      const payload = {
        image: 'https://cdn.pixabay.com/photo/2012/04/11/17/53/approved-29149_960_720.png',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            image: payload.image,
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.image).toEqual(payload.image);
        });
    });

    it('should update externalUrl', async () => {
      const payload = {
        externalUrl: 'https://cdn.pixabay.com/photo/2012/04/11/17/53/approved-29149_960_720.png',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            externalUrl: payload.externalUrl,
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.externalUrl).toEqual(payload.externalUrl);
        });
    });

    it('should update name', async () => {
      const payload = {
        name: 'Test name 2',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            name: payload.name,
            slug: generateSlug(payload.name),
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.name).toEqual(payload.name);
          expect(asset.slug).toEqual(generateSlug(payload.name));
        });
    });

    it('should throw 409 exception if slug is already exist', async () => {
      await createAsset({
        name: 'Test name 3',
        slug: 'test-name-3',
      });
      const payload = {
        name: 'Test name 3',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(409)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Conflict',
            message: 'NAME_ALREADY_TAKEN',
            statusCode: 409,
          });
        });
    });

    it('should update description', async () => {
      const payload = {
        description: 'some new description',
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            description: payload.description,
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.description).toEqual(payload.description);
        });
    });

    it('should update listing properties', async () => {
      const payload = {
        listing: {
          marketplace: MarketplaceEnum.OpenSea,
          auctionType: AuctionTypeEnum.FixedPrice,
        },
      };

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            listing: {
              marketplace: MarketplaceEnum.OpenSea,
              auctionType: AuctionTypeEnum.FixedPrice,
            },
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.marketplace).toEqual(payload.listing.marketplace);
          expect(asset.auctionType).toEqual(payload.listing.auctionType);
        });
    });

    it('should not remove attributes', async () => {
      const payload = {};
      const attribute = await createAttribute({ asset });

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          await attribute.reload();
          expect(attribute).toBeDefined();
        });
    });

    it('should remove attributes', async () => {
      const payload = {
        attributes: [],
      };
      const attribute = await createAttribute({ asset });

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          const savedAttribute = await Attribute.findOne(attribute.id);
          expect(savedAttribute).toBeUndefined();
        });
    });

    it('should create new Attribute', async () => {
      const payload = {
        attributes: [
          {
            trait: 'new trait',
            value: 'new value',
            display: 'text',
          },
        ],
      };
      const attribute = await createAttribute({ asset });

      return request(app.getHttpServer())
        .patch(`/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
          });
        })
        .then(async () => {
          const savedAttribute = await Attribute.findOne(attribute.id);
          expect(savedAttribute).toBeUndefined();
          const newAttributes = await Attribute.find({ where: { assetId: asset.id } });
          expect(newAttributes).toHaveLength(1);
          expect(newAttributes[0]).toEqual(expect.objectContaining(payload.attributes[0]));
        });
    });
  });
});
