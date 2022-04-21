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
import { Asset, Media } from 'modules/assets/entities';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { v4 } from 'uuid';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import crypto from 'crypto';
import { createFile } from '../utils/file.utils';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import { createImageMedia } from '../utils/media.utils';
import { MediaDto } from 'modules/assets/dto/media/media.dto';

describe('MediaController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  const mockedUrl = 'https://example.com';
  const mockTmpFilePath = '/tmp/temp-file.jpeg';
  const dtoRequest: any = {
    url: 'https://example.com/image.png',
    title: 'Example',
    description: 'test',
    type: MediaTypeEnum.Image,
    sortOrder: 1,
  };

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      image: await createFile(),
      slug: 'egg',
      description: 'test-egg',
      partner,
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
    await Media.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST /assets/:assetId/media`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .send(dtoRequest)
        .expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(dtoRequest)
        .expect(401);
    });

    it('should throw 404 exception if partner is not owner', async () => {
      const anotherUser = await createUser({});
      const notOwnerPartner = await createPartner({
        apiKey: 'not-owner-partner-api-key',
        accountOwner: anotherUser,
      });

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': notOwnerPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(404);
    });

    it('should create a new media object in the db', () => {
      const dto: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };
      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(201)
        .then(async () => {
          const getAsset = await Asset.findOne({
            where: { id: asset.id },
            relations: ['media'],
          });
          const media = getAsset.media[0];
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
          expect(media.fileId).toBeDefined();
          expect(media.url).toEqual(dto.url);
          expect(media.description).toEqual(dto.description);

          expect(mockFileDownloadService.download).toHaveBeenCalledWith(dto.url);
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            mockTmpFilePath,
            `assets/media/${asset.id}`,
          );
        });
    });

    it('should throw 409 exception if image media already exist with sortOrder for defined asset', async () => {
      await createImageMedia({ assetId: asset.id, sortOrder: 1 });

      const dtoRequest: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(409)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: 409,
            error: 'Conflict',
            message: 'MEDIA_ORDER_NOT_UNIQUE',
          });
        });
    });

    it('should create object with next sortOrder for defined asset', async () => {
      await createImageMedia({ assetId: asset.id, sortOrder: 1 });

      const dtoRequest: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 2,
      };

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(201)
        .then(async () => {
          const getAsset = await Asset.findOne({
            where: { id: asset.id },
            relations: ['media'],
          });
          const media = getAsset.media;
          expect(media).toBeDefined();
          expect(media.length).toEqual(2);
        });
    });

    it('should support long urls', async () => {
      const newAsset = await createAsset({ refId: '123', partner });
      await createImageMedia({ assetId: newAsset.id, sortOrder: 1 });

      const bigurl = crypto.randomBytes((1024 - 15) / 2).toString('hex');
      const dtoRequest: any = {
        url: `http://foo.com/${bigurl}`,
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      const resp = request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest);

      return resp.expect(201).then(async () => {
        const getAsset = await Asset.findOne({
          where: { id: asset.id },
          relations: ['media'],
        });
        const getNewAsset = await Asset.findOne({
          where: { id: newAsset.id },
          relations: ['media'],
        });

        expect(getAsset.media).toBeDefined();
        expect(getAsset.media.length).toEqual(1);
        expect(getNewAsset.media).toBeDefined();
        expect(getNewAsset.media.length).toEqual(1);
      });
    });

    it('should create object with the same sortOrder for another asset', async () => {
      const newAsset = await createAsset({ refId: '2', partner });
      await createImageMedia({ assetId: newAsset.id, sortOrder: 1 });

      const dtoRequest: MediaDto = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(201)
        .then(async () => {
          const getAsset = await Asset.findOne({
            where: { id: asset.id },
            relations: ['media'],
          });
          const getNewAsset = await Asset.findOne({
            where: { id: newAsset.id },
            relations: ['media'],
          });

          expect(getAsset.media).toBeDefined();
          expect(getAsset.media.length).toEqual(1);
          expect(getNewAsset.media).toBeDefined();
          expect(getNewAsset.media.length).toEqual(1);
        });
    });

    it('should throw an exception if media object is invalid', () => {
      const dtoRequest: any = {};

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(400)
        .expect({
          statusCode: 400,
          message: [
            'title must be shorter than or equal to 200 characters',
            'title should not be empty',
            'url must be an URL address',
            'url must be shorter than or equal to 1024 characters',
            'type must be a valid enum value',
            'type should not be empty',
            'sortOrder should not be empty',
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

      const dtoRequest: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 2,
      };

      return request(app.getHttpServer())
        .post(`/assets/${asset.id}/media`)
        .set({
          'x-api-key': deletedPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(401);
    });
  });
});
