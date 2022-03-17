import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  clearAllData,
  createApp,
  mockFileDownloadService,
  mockS3Provider,
} from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute } from 'modules/assets/entities';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { v4 } from 'uuid';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  const mockedUrl = 'https://example.com';
  const mockTmpFilePath = '/tmp/temp-file.jpeg';

  beforeAll(async () => {
    app = await createApp();
    partner = await createPartner({
      apiKey: 'test-api-key',
    });
    mockS3Provider.getUrl.mockReturnValue(mockedUrl);
    mockS3Provider.upload.mockReturnValue({
      id: v4(),
      name: 'example.jpeg',
      path: 'test/example.jpeg',
      mimeType: 'image/jpeg',
      storage: StorageEnum.S3,
      size: 100,
    });
    mockFileDownloadService.download.mockReturnValue(mockTmpFilePath);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Attribute.delete({});
    await Asset.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST /assets`, () => {
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

      return request(app.getHttpServer()).post(`/assets`).send(transferRequest).expect(401);
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
        .post(`/assets`)
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
              marketplace: 'OPEN_SEA',
              auctionType: 'FIXED_PRICE',
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
        .post(`/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201)
        .then(async () => {
          const asset = await Asset.findOne({
            where: { refId: '1232' },
            relations: ['attributes', 'image'],
          });
          expect(asset).toBeDefined();
          expect(asset.name).toEqual(transferRequest.assets[0].name);
          expect(asset.image).toBeDefined();
          expect(asset.image.path).toEqual('test/example.jpeg');
          expect(asset.description).toEqual(transferRequest.assets[0].description);
          expect(asset.externalUrl).toEqual(transferRequest.assets[0].externalUrl);
          expect(asset.marketplace).toEqual(transferRequest.assets[0].listing.marketplace);
          expect(asset.auctionType).toEqual(transferRequest.assets[0].listing.auctionType);
          expect(asset.attributes[0]).toBeDefined();
          expect(asset.attributes[0].trait).toEqual(transferRequest.assets[0].attributes[0].trait);
          expect(asset.attributes[0].value).toEqual(transferRequest.assets[0].attributes[0].value);
          expect(asset.attributes[0].display).toEqual(
            transferRequest.assets[0].attributes[0].display,
          );
          expect(mockFileDownloadService.download).toHaveBeenCalledWith(
            transferRequest.assets[0].image,
          );
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            mockTmpFilePath,
            `images/assets/${asset.id}`,
          );
        });
    });

    it('should throw 400 exception if asset already exist by refId', async () => {
      await createAsset({ refId: '1232', partner });

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
              marketplace: 'OPEN_SEA',
            },
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 400,
            message: 'Duplicated assets',
            names: ['1232'],
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
        .post(`/assets`)
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
        .post(`/assets`)
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
        .post(`/assets`)
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
