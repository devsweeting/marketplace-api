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
import { Asset, Attribute, Media } from 'modules/assets/entities';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { v4 } from 'uuid';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { Event } from 'modules/events/entities';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

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
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /assets`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer()).post(`/v1/assets`).send(transferRequest).expect(401);
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
            name: 'Example',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(transferRequest)
        .expect(401);
    });

    it('should create a new asset transfer object in the db', () => {
      const media = [
        {
          title: 'test',
          description: 'description',
          url: 'https://example.com/image.png',
          type: MediaTypeEnum.Image,
          sortOrder: 1,
        },
      ];
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            media,
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
        .post(`/v1/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201)
        .then(async () => {
          const asset = await Asset.findOne({
            where: { refId: '1232' },
            relations: ['attributes', 'media', 'media.file'],
          });
          expect(asset).toBeDefined();
          expect(asset.name).toEqual(transferRequest.assets[0].name);
          expect(asset.media).toBeDefined();
          expect(asset.description).toEqual(transferRequest.assets[0].description);
          expect(asset.attributes[0]).toBeDefined();
          expect(asset.attributes[0].trait).toEqual(transferRequest.assets[0].attributes[0].trait);
          expect(asset.attributes[0].value).toEqual(transferRequest.assets[0].attributes[0].value);
          expect(asset.attributes[0].display).toEqual(
            transferRequest.assets[0].attributes[0].display,
          );
          expect(mockFileDownloadService.download).toHaveBeenCalledWith(
            transferRequest.assets[0].media[0].url,
          );
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            mockTmpFilePath,
            `assets/media/${asset.id}`,
          );
        });
    });

    it('should pass if refId is taken by another partner', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      await Event.delete({});
      await Media.delete({});
      await Attribute.delete({});
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
            name: 'Example',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201);
    });

    it('should be able to recreate a deleted asset', async () => {
      await Event.delete({});
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });
      const asset = await createAsset({ refId: '1232', partner: partner2 });
      await softDeleteAsset(asset);
      const transferRequest: any = {
        user: {
          refId: '1232',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '1232',
            name: 'Example 1232',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .then(async () => {
          const asset = await Asset.findOne({
            where: { refId: '1232' },
          });
          expect(asset).toBeDefined();
        });
    });

    it('should pass if name is used for another asset for the same partner', async () => {
      await createAsset({ refId: '1', name: 'New Asset', partner: partner });

      const transferRequest: any = {
        user: {
          refId: '1',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '2',
            name: 'New Asset',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(201);
    });

    it('should pass if name is used for another asset for the different partner', async () => {
      const anotherUser = await createUser({});
      const partner2 = await createPartner({
        apiKey: 'another-partner2-api-key',
        accountOwner: anotherUser,
      });

      await createAsset({ refId: '3', name: 'NewAssetDifferentPartner', partner: partner2 });

      const transferRequest: any = {
        user: {
          refId: '1233',
          email: 'steven@example.com',
        },
        assets: [
          {
            refId: '4',
            name: 'NewAssetDifferentPartner',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
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
            name: 'Example 1',
            description: 'test',
          },
          {
            refId: '1232',
            name: 'Example 2',
            description: 'test',
          },
        ],
      };

      return request(app.getHttpServer())
        .post(`/v1/assets`)
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
        .post(`/v1/assets`)
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
        .post(`/v1/assets`)
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
        .post(`/v1/assets`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(transferRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'assets.0.refId must be shorter than or equal to 100 characters',
            'assets.0.name must be shorter than or equal to 200 characters',
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
        .post(`/v1/assets`)
        .set({
          'x-api-key': deletedPartner.apiKey,
        })
        .send(transferRequest)
        .expect(401);
    });
  });
});
