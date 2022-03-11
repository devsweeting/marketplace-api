import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { Asset, Attribute, Partner } from 'modules/partners/entities';
import { createAsset } from '@/test/utils/asset.utils';

describe('PartnersController', () => {
  let app: INestApplication;
  let partner: Partner;

  beforeEach(async () => {
    app = await createApp();
    partner = await createPartner({
      name: 'Test',
      apiKey: 'test-api-key',
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Attribute.delete({});
    await Asset.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST /partners/assets`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
            listing: {
              marketplace: 'OpenSea',
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .send(transferRequest)
        .expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
            listing: {
              marketplace: 'OpenSea',
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(transferRequest)
        .expect(401);
    });

    it('should create a new asset transfer object in the db', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
            externalUrl: 'https://example.com/page-1',
            listing: {
              marketplace: 'OpenSea',
            },
            attributes: [
              {
                trait: 'trait name',
                value: 'some value',
                display: 'text',
              },
            ],
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201)
        .then(async () => {
          const asset = await Asset.findOne({
            where: { refId: '1232' },
          });
          const attribute = await Attribute.findOne({
            where: { assetId: asset.id },
          });
          expect(asset).toBeDefined();
          expect(asset.name).toEqual(transferRequest.assets[0].name);
          expect(asset.image).toEqual(transferRequest.assets[0].image);
          expect(asset.description).toEqual(transferRequest.assets[0].description);
          expect(asset.externalUrl).toEqual(transferRequest.assets[0].externalUrl);
          expect(attribute).toBeDefined();
          expect(attribute.trait).toEqual(transferRequest.assets[0].attributes[0].trait);
          expect(attribute.value).toEqual(transferRequest.assets[0].attributes[0].value);
          expect(attribute.display).toEqual(transferRequest.assets[0].attributes[0].display);
        });
    });

    it('should throw 400 exception if asset already exist', async () => {
      await createAsset({ slug: 'example', partner });

      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
            listing: {
              marketplace: 'OpenSea',
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 400,
            message: 'Duplicated assets',
            names: ['Example'],
          });
        });
    });

    it('should throw an exception if assets property is undefined', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets should not be null or undefined',
            'assets must contain at least 1 elements',
          ],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if assets property is empty', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['assets must contain at least 1 elements'],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if asset object is invalid', () => {
      const transferRequest: any = {
        user: {
          refId: 'test',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: 'a'.repeat(105),
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/partners/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.refId must be shorter than or equal to 100 characters',
            'assets.0.listing should not be empty',
            'assets.0.image must be shorter than or equal to 255 characters',
            'assets.0.image should not be empty',
            'assets.0.name must be shorter than or equal to 50 characters',
            'assets.0.name should not be empty',
            'assets.0.description should not be empty',
          ],
          error: 'Bad Request',
        });
    });
  });
});