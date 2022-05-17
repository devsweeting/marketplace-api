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
import { Asset, Attribute, Media } from 'modules/assets/entities';
import { v4 } from 'uuid';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { generateSlug } from 'modules/common/helpers/slug.helper';
import { createAttribute } from '@/test/utils/attribute.utils';
import { StorageEnum } from 'modules/storage/enums/storage.enum';
import { User } from 'modules/users/user.entity';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createUser } from '../utils/create-user';
import { MediaTypeEnum } from 'modules/assets/enums/media-type.enum';

describe('AssetsController', () => {
  let app: INestApplication;
  let partner: Partner;
  let user: User;
  let asset: Asset;
  let assetTransformer: AssetsTransformer;

  beforeAll(async () => {
    app = await createApp();
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({ partner });
    assetTransformer = app.get(AssetsTransformer);
  });

  afterEach(async () => {
    await Media.delete({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`PATCH V1 /assets/:id`, () => {
    it('should throw 401 exception if auth token is missing', () => {
      return request(app.getHttpServer()).patch(`/v1/assets/${asset.id}`).send({}).expect(401);
    });

    it('should throw 401 exception if token is invalid', () => {
      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': 'invalid key',
        })
        .send({})
        .expect(401);
    });

    it('should throw 404 exception if asset does not exist', async () => {
      return request(app.getHttpServer())
        .patch(`/v1/assets/${v4()}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send({})
        .expect(404);
    });

    it('should throw 404 exception if assets belongs to another partner', async () => {
      const anotherUser = await createUser({});
      const anotherPartner = await createPartner({
        apiKey: 'another-api-key',
        accountOwner: anotherUser,
      });
      const anotherAsset = await createAsset({ partner: anotherPartner });

      return request(app.getHttpServer())
        .patch(`/v1/assets/${anotherAsset.id}`)
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
        .patch(`/v1/assets/${asset.id}`)
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
            partner: null,
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
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
            partner: null,
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
        .patch(`/v1/assets/${asset.id}`)
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

    it('should update media', async () => {
      const payload = {
        media: [
          {
            title: 'UPDATED',
            description: 'description',
            url: 'https://example.com/image.png',
            type: MediaTypeEnum.Image,
          },
        ],
      };
      mockS3Provider.upload.mockReturnValue({
        id: v4(),
        name: 'example.jpeg',
        path: 'test/example.jpeg',
        mimeType: 'image/jpeg',
        storage: StorageEnum.S3,
        size: 100,
      });
      mockS3Provider.getUrl.mockReturnValue('mocked-url');
      mockFileDownloadService.download.mockReturnValue('downloaded-path');

      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .then(async () => {
          const updatedAsset = await Asset.findOne({
            where: { id: asset.id },
            relations: ['media', 'media.file'],
          });
          expect(updatedAsset.media[0]).toBeDefined();
          expect(updatedAsset.media[0].title).toEqual(payload.media[0].title);
          expect(updatedAsset.media[0].file.path).toEqual('test/example.jpeg');
          expect(mockS3Provider.upload).toHaveBeenCalledWith(
            'downloaded-path',
            `assets/${updatedAsset.id}`,
          );
        });
    });

    it('should update name', async () => {
      const payload = {
        name: 'Test name 2',
      };

      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
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
            partner: null,
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.name).toEqual(payload.name);
          expect(asset.slug).toEqual(generateSlug(payload.name));
        });
    });

    it('should throw 409 exception if refID is already exist', async () => {
      await createAsset({
        refId: 'ref-1',
        partnerId: partner.id,
      });
      const payload = {
        refId: 'ref-1',
      };

      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
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

    it('should update description', async () => {
      const payload = {
        description: 'some new description',
      };

      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
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
            partner: null,
          });
        })
        .then(async () => {
          await asset.reload();
          expect(asset.description).toEqual(payload.description);
        });
    });

    it('should not remove attributes', async () => {
      const payload = {};
      const attribute = await createAttribute({ asset });

      return request(app.getHttpServer())
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
            partner: null,
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
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
            partner: null,
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
        .patch(`/v1/assets/${asset.id}`)
        .set({
          'x-api-key': partner.apiKey,
        })
        .send(payload)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual({
            ...assetTransformer.transform(asset),
            updatedAt: expect.any(String),
            partner: null,
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
