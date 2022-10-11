import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp } from '@/test/utils/app.utils';
import { createPartner } from '@/test/utils/partner.utils';
import { createAsset } from '@/test/utils/asset.utils';
import { Partner } from 'modules/partners/entities';
import { File } from 'modules/storage/entities/file.entity';
import { Asset, Media } from 'modules/assets/entities';
import { User } from 'modules/users/entities/user.entity';
import { createUser } from '../utils/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';
import { createImageMedia } from '../utils/media.utils';
import { MediaDto } from 'modules/assets/dto/media/media.dto';
import { StatusCodes } from 'http-status-codes';

describe('MediaController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  const imageUrl =
    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
  const dtoRequest: MediaDto = {
    sourceUrl: imageUrl,
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
    asset = await createAsset(
      {
        refId: '1',
        name: 'Egg',
        description: 'test-egg',
      },
      partner,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Media.delete({});
    await File.delete({});
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`POST V1 /assets/:assetId/media`, () => {
    test('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .send(dtoRequest)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    test('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send(dtoRequest)
        .expect(StatusCodes.UNAUTHORIZED);
    });

    test('should throw 404 exception if partner is not owner', async () => {
      const anotherUser = await createUser({});
      const notOwnerPartner = await createPartner({
        apiKey: 'not-owner-partner-api-key',
        accountOwner: anotherUser,
      });

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': notOwnerPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.NOT_FOUND);
    });

    test('should create a new media object in the db', () => {
      const dto: MediaDto = {
        sourceUrl: 'https://avatars.githubusercontent.com/u/3612?v=4',
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };
      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dto)
        .expect(StatusCodes.CREATED)
        .then(async () => {
          const getAsset = await Asset.findOne({
            where: { id: asset.id },
            relations: ['media', 'media.file'],
          });
          const media = getAsset.media[0];
          expect(media).toBeDefined();
          expect(media.title).toEqual(dto.title);
          expect(media.fileId).toBeDefined();
          expect(media.sourceUrl).toEqual(dto.sourceUrl);
          expect(media.description).toEqual(dto.description);
          expect(media.type).toEqual(dto.type);
          expect(media.file).toBeDefined();
          expect(media.file.absoluteUrl).toEqual(
            process.env.AWS_ENDPOINT + '/test-bucket/assets/' + asset.id + '/' + media.file.name,
          );
        });
    });

    test('should throw 409 exception if image media already exist with sortOrder for defined asset', async () => {
      await createImageMedia({ assetId: asset.id, sortOrder: 1 });

      const dtoRequest: MediaDto = {
        sourceUrl: imageUrl,
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.CONFLICT)
        .expect(({ body }) => {
          expect(body).toEqual({
            statusCode: StatusCodes.CONFLICT,
            error: 'Conflict',
            message: 'MEDIA_ORDER_NOT_UNIQUE',
          });
        });
    });

    test('should create object with next sortOrder for defined asset', async () => {
      await createImageMedia({ assetId: asset.id, sortOrder: 1 });

      const dtoRequest: MediaDto = {
        sourceUrl: imageUrl,
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 2,
      };

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.CREATED)
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

    test('should create object with the same sortOrder for another asset', async () => {
      const newAsset = await createAsset({ refId: '2' }, partner);
      await createImageMedia({ assetId: newAsset.id, sortOrder: 1 });

      const dtoRequest: MediaDto = {
        sourceUrl: imageUrl,
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 1,
      };

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.CREATED)
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

    test('should throw an exception if media object is invalid', () => {
      const dtoRequest: any = {};

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.BAD_REQUEST)
        .expect({
          statusCode: StatusCodes.BAD_REQUEST,
          message: [
            'title must be shorter than or equal to 200 characters',
            'title should not be empty',
            'sourceUrl must be an URL address',
            'sourceUrl must be shorter than or equal to 1024 characters',
            'type must be a valid enum value',
            'type should not be empty',
            'sortOrder should not be empty',
          ],
          error: 'Bad Request',
        });
    });

    test('should throw an exception if partner is deleted', async () => {
      const anotherUser = await createUser({});
      const deletedPartner = await createPartner({
        apiKey: 'deleted-partner-api-key',
        accountOwner: anotherUser,
        deletedAt: new Date(),
        isDeleted: true,
      });

      const dtoRequest: any = {
        sourceUrl: imageUrl,
        title: 'Example',
        description: 'test',
        type: MediaTypeEnum.Image,
        sortOrder: 2,
      };

      return request(app.getHttpServer())
        .post(`/v1/assets/${asset.id}/media`)
        .set({
          'x-api-key': deletedPartner.apiKey,
        })
        .send(dtoRequest)
        .expect(StatusCodes.UNAUTHORIZED);
    });
  });
});
