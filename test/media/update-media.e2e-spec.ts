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

import { createFile } from '../utils/file.utils';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import { createImageMedia } from '../utils/media.utils';

describe('MediaController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let imageMedia: Media;
  const mockedUrl = 'https://example.com';
  const mockTmpFilePath = '/tmp/temp-file.jpeg';

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
  beforeEach(async () => {
    imageMedia = await createImageMedia({ assetId: asset.id, sortOrder: 1 });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Media.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH V1 /media/:id`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      const dtoRequest = { title: 'title' };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .send(dtoRequest)
        .expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      const dtoRequest = { title: 'title' };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(dtoRequest)
        .expect(401);
    });

    it('should throw 404 exception if partner is not owner', async () => {
      const dtoRequest = { title: 'title' };
      const anotherUser = await createUser({});
      const notOwnerPartner = await createPartner({
        apiKey: 'not-owner-partner-api-key',
        accountOwner: anotherUser,
      });

      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': notOwnerPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(404);
    });

    it('should update a title of media object', () => {
      const dto: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(200)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
        });
    });
    it('should update description of a media object', () => {
      const dto: any = {
        url: 'https://example.com/image.png',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(200)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
          expect(media.fileId).toBeDefined();
          expect(media.url).toEqual(dto.url);
          expect(media.description).toEqual(dto.description);
        });
    });
    it('should update file of a media object', () => {
      const dto: any = {
        url: 'https://picsum.photos/400/200',
        type: MediaTypeEnum.Image,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(200)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(imageMedia.title);
          expect(media.description).toEqual(imageMedia.description);
          expect(media.fileId).toBeDefined();
          expect(media.url).toEqual(dto.url);

          expect(mockFileDownloadService.download).toHaveBeenCalledWith(dto.url);
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            mockTmpFilePath,
            `assets/media/${asset.id}`,
          );
        });
    });
    it('should update file to null if type is youtube', () => {
      const dto: any = {
        url: 'https://picsum.photos/400/200',
        type: MediaTypeEnum.Youtube,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(200)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(imageMedia.title);
          expect(media.description).toEqual(imageMedia.description);
          expect(media.fileId).toEqual(null);
          expect(media.url).toEqual(dto.url);

          expect(mockFileDownloadService.download).not.toHaveBeenCalled();
          expect(mockS3Provider.upload).not.toHaveBeenCalledWith();
        });
    });
    it('should update sortOrder of a media object', () => {
      const dto: any = {
        sortOrder: 100,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(200)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.sortOrder).toEqual(dto.sortOrder);
        });
    });

    it('should update the same media with field sortOrder for defined asset', async () => {
      const dtoRequest: any = {
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            assetId: imageMedia.assetId,
            description: dtoRequest.description,
            fileId: imageMedia.fileId,
            sortOrder: dtoRequest.sortOrder,
            title: dtoRequest.title,
            url: imageMedia.url,
          });
        });
    });

    it('should throw an exception if media object is invalid', () => {
      const dtoRequest: any = {};

      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(200);
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
        .patch(`/v1/media/${imageMedia}.id`)
        .set({
          'x-api-key': deletedPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(401);
    });
  });
});
