import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { clearAllData, createApp, mockS3Provider } from '@/test/utils/app.utils';
import { Asset, Media } from 'modules/assets/entities';
import { createAsset } from '@/test/utils/asset.utils';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { v4 } from 'uuid';
import { Partner } from 'modules/partners/entities';
import { createPartner } from '../utils/partner.utils';
import { User } from 'modules/users/user.entity';
import { createUser } from '../utils/fixtures/create-user';
import { RoleEnum } from 'modules/users/enums/role.enum';
import { createImageMedia } from '../utils/media.utils';
import { MediaTransformer } from 'modules/assets/transformers/media.transformer';
import { createFile } from '../utils/file.utils';

describe('AssetsController', () => {
  let app: INestApplication;
  let asset: Asset;
  let partner: Partner;
  let user: User;
  let assetsTransformer: AssetsTransformer;
  let mediaTransformer: MediaTransformer;
  const mockedFileUrl = 'http://example.com';

  beforeAll(async () => {
    app = await createApp();
    assetsTransformer = app.get(AssetsTransformer);
    mediaTransformer = app.get(MediaTransformer);
    user = await createUser({ email: 'partner@test.com', role: RoleEnum.USER });
    partner = await createPartner({
      apiKey: 'test-api-key',
      accountOwner: user,
    });
    asset = await createAsset({
      refId: '1',
      name: 'Egg',
      slug: 'egg',
      description: 'test-egg',
      partner,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await clearAllData();
  });

  describe(`GET /assets/:id`, () => {
    it('should return asset', async () => {
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);
      const media = await createImageMedia({ assetId: asset.id, file: await createFile({}) });
      const response = {
        ...assetsTransformer.transform(asset),
        media: mediaTransformer.transformAll([media]),
      };
      return request(app.getHttpServer())
        .get(`/assets/${asset.id}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(response);
        })
        .then(() => {
          expect(mockS3Provider.getUrl).toHaveBeenCalledWith(media.file);
        });
    });

    it('should return asset only with active media', async () => {
      await Media.delete({});
      mockS3Provider.getUrl.mockReturnValue(mockedFileUrl);
      const file = await createFile({});
      const media = await createImageMedia({ assetId: asset.id, file, fileId: file.id });
      await createImageMedia({ assetId: asset.id, isDeleted: true, deletedAt: new Date() });
      const response = {
        ...assetsTransformer.transform(asset),
        media: mediaTransformer.transformAll([media]),
      };
      return request(app.getHttpServer())
        .get(`/assets/${asset.id}`)
        .send()
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(response);
          expect(body.media.length).toEqual(1);
        })
        .then(() => {
          expect(mockS3Provider.getUrl).toHaveBeenCalledWith(media.file);
        });
    });

    it('should 400 exception id is invalid', () => {
      return request(app.getHttpServer())
        .get(`/assets/123`)
        .send()
        .expect(400)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Bad Request',
            message: ['id must be a UUID'],
            statusCode: 400,
          });
        });
    });

    it('should 404 exception if file does not exist', () => {
      return request(app.getHttpServer())
        .get(`/assets/${v4()}`)
        .send()
        .expect(404)
        .expect(({ body }) => {
          expect(body).toEqual({
            error: 'Not Found',
            message: 'ASSET_NOT_FOUND',
            statusCode: 404,
          });
        });
    });
  });
});
