import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  clearAllData,
  createApp,
  mockFileDownloadService,
  mockS3Provider,
} from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset, softDeleteAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Attribute } from 'modules/assets/entities';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { v4 } from 'uuid';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Event } from 'modules/events/entities';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  const mockedUrl = 'https://example.com';
  const mockTmpFilePath = '/tmp/temp-file.jpeg';

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    mockS3Provider.getUrl.mockReturnValue(mockedUrl);
    mockFileDownloadService.download.mockReturnValue(mockTmpFilePath);
    mockS3Provider.upload.mockReturnValue({
      id: v4(),
      name: 'example.jpeg',
      path: 'test/example.jpeg',
      mimeType: 'image/jpeg',
      storage: StorageEnum.S3,
      size: 100,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Attribute.delete({});
    await Event.delete({});
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
          expect(asset.attributes[0]).toBeDefined();
          expect(asset.attributes[0].trait).toEqual(transferRequest.assets[0].attributes[0].trait);
          expect(asset.attributes[0].value).toEqual(transferRequest.assets[0].attributes[0].value);
          expect(asset.attributes[0].display).toEqual(
            transferRequest.assets[0].attributes[0].display,
          );
          expect(mockFileDownloadService.download).toHaveBeenCalledWith(
            transferRequest.assets[0].image,
          );
          expect(mockS3Provider.upload).toHaveBeenCalledWith(mockTmpFilePath, `assets/${asset.id}`);
        });
    });

    it('should pass if refId is taken by another partner', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      await Asset.delete({});
      await createAsset({ refId: '1232', partner: partner2 });

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
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201);
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
            refIds: ['1232'],
          });
        });
    });

    it('should be able to recreate a deleted asset', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      const asset = await createAsset({ refId: '1232', partner: partner2 });
      softDeleteAsset(asset);
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
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201);
    });

    it('should throw 400 exception if asset already exist by refId (same request)', async () => {
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
          },
          {
            refId: '1232',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
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
            refIds: ['1232'],
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
            'assets.0.image must be shorter than or equal to 255 characters',
            'assets.0.image should not be empty',
            'assets.0.name must be shorter than or equal to 50 characters',
            'assets.0.name should not be empty',
            'assets.0.description should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    it('should throw an exception if partner is deleted', async () => {
      const anotherUser = await createUser({});
      const deletedPartner = await createPartner({
        apiKey: 'deleted-partner-api-key',
        accountOwner: anotherUser,
        deletedAt: new Date(),
        isDeleted: true,
      });

      const transferRequest: any = {
        user: {
          refId: '1236',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1236',
            image: 'https://example.com/image.png',
            name: 'Example',
            description: 'test',
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
          'x-api-key': deletedPartner.apiKey,
        })
        .send(transferRequest)
        .expect(401);
    });
  });
});
