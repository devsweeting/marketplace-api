import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { Asset, Media } from 'modules/assets/entities';
import { File } from 'modules/storage/entities/file.entity';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';

import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import { createImageMedia } from '../utils/media.utils';
import { createFile } from '../utils/file.utils';
import { MediaDto } from 'modules/assets/dto/media/media.dto';
import { StatusCodes } from 'http-status-codes';

describe('MediaController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let imageMedia: Media;
  let file: File;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
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
    file = await createFile({});
    imageMedia = await createImageMedia({ assetId: asset.id, sortOrder: 1, file, fileId: file.id });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Media.delete({});
    await File.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH V1 /media/:id`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      const dtoRequest = { title: 'title' };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .send(dtoRequest)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    test('should throw 401 exception if token is invalid', () => {
      const dtoRequest = { title: 'title' };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(dtoRequest)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    test('should throw 404 exception if partner is not owner', async () => {
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
        .expect(StatusCodes.NOT_FOUND);
    });

    test('should update a title of media object', () => {
      const dto: Record<string, unknown> = {
        url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
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
        .expect(StatusCodes.OK)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
        });
    });
    test('should update description of a media object', () => {
      const dto: Record<string, unknown> = {
        url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
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
        .expect(StatusCodes.OK)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
          expect(media.fileId).toBeDefined();
          expect(media.sourceUrl).toEqual(dto.url);
          expect(media.description).toEqual(dto.description);
        });
    });
    test('should update file of a media object', () => {
      const dto: Record<string, unknown> = {
        url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        type: MediaTypeEnum.Image,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(StatusCodes.OK)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(imageMedia.title);
          expect(media.description).toEqual(imageMedia.description);
          expect(media.fileId).toBeDefined();
          expect(media.sourceUrl).toEqual(dto.url);
        });
    });
    test('should update file to null if type is youtube', () => {
      const dto: Record<string, unknown> = {
        url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        type: MediaTypeEnum.Youtube,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(StatusCodes.OK)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.title).toEqual(imageMedia.title);
          expect(media.description).toEqual(imageMedia.description);
          expect(media.fileId).toEqual(null);
          expect(media.sourceUrl).toEqual(dto.url);
        });
    });
    test('should update sortOrder of a media object', () => {
      const dto: Record<string, unknown> = {
        sortOrder: 100,
      };
      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(StatusCodes.OK)
        .then(async () => {
          const media = await Media.findOne({
            where: { id: imageMedia.id },
          });
          expect(media).toBeDefined();
          expect(media.sortOrder).toEqual(dto.sortOrder);
        });
    });

    test('should update the same media with field sortOrder for defined asset', async () => {
      const dtoRequest: Partial<MediaDto> = {
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
        .expect(StatusCodes.OK)
        .expect(({ body }) => {
          expect(body).toEqual({
            id: imageMedia.id,
            assetId: imageMedia.assetId,
            description: dtoRequest.description,
            file: null,
            fileId: imageMedia.fileId,
            sortOrder: dtoRequest.sortOrder,
            title: dtoRequest.title,
            sourceUrl: imageMedia.sourceUrl,
            absoluteUrl: null,
          });
        });
    });

    test('should throw an exception if media object is invalid', () => {
      const dtoRequest: Record<string, unknown> = {};

      return request(app.getHttpServer())
        .patch(`/v1/media/${imageMedia.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.OK);
    });

    test('should throw an exception if partner is deleted', async () => {
      const anotherUser = await createUser({});
      const deletedPartner = await createPartner({
        apiKey: 'deleted-partner-api-key',
        accountOwner: anotherUser,
        deletedAt: new Date(),
        isDeleted: true,
      });

      const dtoRequest: MediaDto = {
        sourceUrl:
          'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
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
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
